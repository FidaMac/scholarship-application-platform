import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import { Profile, User } from "@shared/schema";

const profileSchema = z.object({
  phone: z.string().optional(),
  school: z.string().min(1, { message: "School name is required" }),
  major: z.string().min(1, { message: "Major is required" }),
  gpa: z.string().min(1, { message: "GPA is required" }),
  graduationDate: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

interface ProfileCardProps {
  profile: Profile | undefined;
  user: User | null;
}

export function ProfileCard({ profile, user }: ProfileCardProps) {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      phone: profile?.phone || "",
      school: profile?.school || "",
      major: profile?.major || "",
      gpa: profile?.gpa || "",
      graduationDate: profile?.graduationDate || "",
    },
  });
  
  const updateProfile = useMutation({
    mutationFn: async (values: ProfileFormValues) => {
      const res = await apiRequest("POST", "/api/profile", values);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/profile"] });
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      });
      setIsEditing(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  function onSubmit(values: ProfileFormValues) {
    updateProfile.mutate(values);
  }
  
  function handleEditClick() {
    // Reset form with current values
    form.reset({
      phone: profile?.phone || "",
      school: profile?.school || "",
      major: profile?.major || "",
      gpa: profile?.gpa || "",
      graduationDate: profile?.graduationDate || "",
    });
    setIsEditing(true);
  }
  
  return (
    <Card>
      <CardContent className="p-6">
        <h3 className="text-lg font-semibold">Your Profile</h3>
        
        {!isEditing ? (
          // Display mode
          <div className="mt-4 space-y-4">
            <div className="space-y-1">
              <label className="text-sm font-medium">Name</label>
              <p className="text-gray-800">{user?.firstName} {user?.lastName}</p>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Email</label>
              <p className="text-gray-800">{user?.email}</p>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Phone</label>
              <p className="text-gray-800">{profile?.phone || "-"}</p>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">School</label>
              <p className="text-gray-800">{profile?.school || "-"}</p>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Major</label>
              <p className="text-gray-800">{profile?.major || "-"}</p>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">GPA</label>
              <p className="text-gray-800">{profile?.gpa || "-"}</p>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Expected Graduation</label>
              <p className="text-gray-800">{profile?.graduationDate || "-"}</p>
            </div>
            <div className="mt-4">
              <Button variant="outline" onClick={handleEditClick}>
                Edit Profile
              </Button>
            </div>
          </div>
        ) : (
          // Edit mode
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="mt-4 space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                {/* Read-only fields */}
                <div>
                  <FormLabel>First Name</FormLabel>
                  <Input value={user?.firstName || ""} disabled />
                </div>
                <div>
                  <FormLabel>Last Name</FormLabel>
                  <Input value={user?.lastName || ""} disabled />
                </div>
                <div className="md:col-span-2">
                  <FormLabel>Email</FormLabel>
                  <Input value={user?.email || ""} disabled />
                </div>
                
                {/* Editable fields */}
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone</FormLabel>
                      <FormControl>
                        <Input placeholder="(555) 123-4567" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="school"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>School</FormLabel>
                      <FormControl>
                        <Input placeholder="University name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="major"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Major</FormLabel>
                      <FormControl>
                        <Input placeholder="Your field of study" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="gpa"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>GPA</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., 3.75" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="graduationDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Expected Graduation</FormLabel>
                      <FormControl>
                        <Input type="month" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="flex space-x-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditing(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={updateProfile.isPending}>
                  {updateProfile.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </Button>
              </div>
            </form>
          </Form>
        )}
      </CardContent>
    </Card>
  );
}
