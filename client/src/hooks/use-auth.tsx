import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import {
  useQuery,
  useMutation,
  UseMutationResult,
} from "@tanstack/react-query";
import { InsertUser, User } from "@shared/schema";
import { getQueryFn, apiRequest, queryClient } from "../lib/queryClient";
import { useToast } from "@/hooks/use-toast";

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  error: Error | null;
  loginMutation: UseMutationResult<Omit<User, "password">, Error, LoginData>;
  logoutMutation: UseMutationResult<void, Error, void>;
  registerMutation: UseMutationResult<Omit<User, "password">, Error, InsertUser>;
};

type LoginData = {
  email: string;
  password: string;
};

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const [demoUser, setDemoUser] = useState<User | null>(null);
  const [isNetlifyDeployment, setIsNetlifyDeployment] = useState(false);

  // Check if this is a Netlify deployment and if we have a demo user
  useEffect(() => {
    // This will be true if we're on Netlify (not localhost)
    const isNetlify = window.location.hostname.includes('.netlify.app') || 
                      !window.location.hostname.includes('localhost');
    setIsNetlifyDeployment(isNetlify);

    // Check for demo user in localStorage
    const storedDemoUser = localStorage.getItem('demoUser');
    if (storedDemoUser) {
      try {
        setDemoUser(JSON.parse(storedDemoUser));
      } catch (e) {
        console.error("Failed to parse demo user from localStorage", e);
        localStorage.removeItem('demoUser');
      }
    }
  }, []);

  // Use the demo user if we're in demo mode, otherwise use the real API
  const {
    data: apiUser,
    error,
    isLoading: apiLoading,
  } = useQuery<User | undefined, Error>({
    queryKey: ["/api/user"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    // Skip the API call if we're in demo mode to avoid console errors
    enabled: !isNetlifyDeployment || !demoUser,
  });

  // Combine demo user and API user
  const user = demoUser || apiUser;
  const isLoading = !demoUser && apiLoading;

  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginData) => {
      const res = await apiRequest("POST", "/api/login", credentials);
      return await res.json();
    },
    onSuccess: (user: User) => {
      queryClient.setQueryData(["/api/user"], user);
      toast({
        title: "Login successful",
        description: `Welcome back, ${user.firstName}!`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Login failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (userData: InsertUser) => {
      const res = await apiRequest("POST", "/api/register", userData);
      return await res.json();
    },
    onSuccess: (user: User) => {
      queryClient.setQueryData(["/api/user"], user);
      toast({
        title: "Registration successful",
        description: `Welcome, ${user.firstName}!`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Registration failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      // If we're in demo mode, just clear the localStorage
      if (isNetlifyDeployment && demoUser) {
        localStorage.removeItem('demoUser');
        setDemoUser(null);
        return;
      }
      // Otherwise, call the actual logout API
      await apiRequest("POST", "/api/logout");
    },
    onSuccess: () => {
      queryClient.setQueryData(["/api/user"], null);
      
      // If we were in demo mode, clear the demo user
      if (demoUser) {
        localStorage.removeItem('demoUser');
        setDemoUser(null);
      }
      
      toast({
        title: "Logged out",
        description: "You have been successfully logged out.",
      });
    },
    onError: (error: Error) => {
      // For demo mode, we should never get here since we bypass the API
      if (isNetlifyDeployment && demoUser) {
        localStorage.removeItem('demoUser');
        setDemoUser(null);
        
        queryClient.setQueryData(["/api/user"], null);
        toast({
          title: "Logged out",
          description: "You have been successfully logged out of demo mode.",
        });
        return;
      }
      
      toast({
        title: "Logout failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return (
    <AuthContext.Provider
      value={{
        user: user ?? null,
        isLoading,
        error,
        loginMutation,
        logoutMutation,
        registerMutation,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
