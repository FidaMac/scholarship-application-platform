import { useState, ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Loader2, Menu, LogOut, User, ChevronDown, Sun } from "lucide-react";

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const { user, logoutMutation } = useAuth();
  const [, navigate] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const handleLogout = () => {
    logoutMutation.mutate();
  };
  
  return (
    <div className="flex min-h-screen flex-col">
      {/* Navigation */}
      <header className="sticky top-0 z-50 border-b bg-white">
        <div className="container flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-6 w-6 text-primary"
              >
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
              </svg>
              <span className="font-bold text-xl">Scholarship Portal</span>
            </Link>
          </div>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex flex-1 items-center justify-between ml-8">
            <div className="flex items-center space-x-6">
              <Link href="/" className="text-sm font-medium transition-colors hover:text-primary">
                Dashboard
              </Link>
              {user?.role === "admin" && (
                <Link href="/admin" className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">
                  Admin
                </Link>
              )}
              <Link href="/resources" className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">
                Resources
              </Link>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="cursor-pointer p-2 hover:bg-gray-100 rounded-md">
                <Sun className="w-5 h-5" />
              </div>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center space-x-1">
                    <span>{user?.firstName}</span>
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem className="cursor-pointer">
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    className="cursor-pointer text-red-500 focus:text-red-500" 
                    onClick={handleLogout}
                    disabled={logoutMutation.isPending}
                  >
                    {logoutMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        <span>Logging out...</span>
                      </>
                    ) : (
                      <>
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Logout</span>
                      </>
                    )}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </nav>
          
          {/* Mobile menu button */}
          <button 
            className="inline-flex items-center justify-center rounded-md p-2 text-gray-500 md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <Menu className="h-6 w-6" />
            <span className="sr-only">Open menu</span>
          </button>
        </div>
        
        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden">
            <div className="space-y-1 px-4 pb-3 pt-2">
              <Link href="/" className="block rounded-md px-3 py-2 text-base font-medium hover:bg-gray-100">
                Dashboard
              </Link>
              {user?.role === "admin" && (
                <Link href="/admin" className="block rounded-md px-3 py-2 text-base font-medium hover:bg-gray-100">
                  Admin
                </Link>
              )}
              <Link href="/resources" className="block rounded-md px-3 py-2 text-base font-medium hover:bg-gray-100">
                Resources
              </Link>
              <button 
                className="block w-full text-left rounded-md px-3 py-2 text-base font-medium text-red-500 hover:bg-gray-100"
                onClick={handleLogout}
                disabled={logoutMutation.isPending}
              >
                {logoutMutation.isPending ? "Logging out..." : "Logout"}
              </button>
            </div>
          </div>
        )}
      </header>
      
      {/* Main Content */}
      <main className="flex-1 bg-gray-50">{children}</main>
      
      {/* Footer */}
      <footer className="border-t bg-white py-6">
        <div className="container px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <p className="text-center text-sm leading-loose text-gray-500 md:text-left">
              © 2023 Scholarship Foundation. All rights reserved.
            </p>
            <div className="flex items-center gap-4">
              <a href="#" className="text-sm text-gray-500 hover:underline">
                Privacy Policy
              </a>
              <a href="#" className="text-sm text-gray-500 hover:underline">
                Terms of Service
              </a>
              <a href="#" className="text-sm text-gray-500 hover:underline">
                Contact
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
