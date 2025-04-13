import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DocumentUpload } from "@/components/document-upload";
import { Loader2 } from "lucide-react";
import { Scholarship } from "@shared/schema";

const applicationSchema = z.object({
  scholarshipId: z.string().min(1, { message: "Please select a scholarship" }),
  gpa: z.string().min(1, { message: "GPA is required" }),
  graduationDate: z.string().min(1, { message: "Expected graduation date is required" }),
  personalStatement: z.string().min(100, { message: "Personal statement must be at least 100 characters" }),
});

type ApplicationFormValues = z.infer<typeof applicationSchema>;

interface ApplicationFormProps {
  scholarships: Scholarship[];
  onSubmitSuccess: () => void;
  onCancel: () => void;
}

export function ApplicationForm({ scholarships, onSubmitSuccess, onCancel }: ApplicationFormProps) {
  const { toast } = useToast();
  
  const form = useForm<ApplicationFormValues>({
    resolver: zodResolver(applicationSchema),
    defaultValues: {
      scholarshipId: "",
      gpa: "",
      graduationDate: "",
      personalStatement: "",
    },
  });
  
  const createApplication = useMutation({
    mutationFn: async (values: ApplicationFormValues) => {
      const formattedValues = {
        ...values,
        scholarshipId: parseInt(values.scholarshipId),
      };
      const res = await apiRequest("POST", "/api/applications", formattedValues);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/applications"] });
      toast({
        title: "Application submitted",
        description: "Your scholarship application has been submitted successfully.",
      });
      onSubmitSuccess();
    },
    onError: (error: Error) => {
      toast({
        title: "Submission failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  function onSubmit(values: ApplicationFormValues) {
    createApplication.mutate(values);
  }
  
  return (
    <Card>
      <CardContent className="p-6">
        <h3 className="text-lg font-semibold mb-4">New Scholarship Application</h3>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="scholarshipId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Select Scholarship</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a scholarship" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {scholarships.map((scholarship) => (
                          <SelectItem
                            key={scholarship.id}
                            value={scholarship.id.toString()}
                          >
                            {scholarship.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="gpa"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Current GPA</FormLabel>
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
              
              <FormField
                control={form.control}
                name="personalStatement"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Personal Statement</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe why you should be considered for this scholarship..."
                        className="min-h-[120px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div>
                <FormLabel className="block mb-2">Upload Documents</FormLabel>
                <DocumentUpload />
              </div>
            </div>
            
            <div className="flex items-center justify-end space-x-4">
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
              <Button type="submit" disabled={createApplication.isPending}>
                {createApplication.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting
                  </>
                ) : (
                  "Submit Application"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
