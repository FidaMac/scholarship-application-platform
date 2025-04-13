import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { StatusBadge } from "@/components/status-badge";
import { Loader2 } from "lucide-react";
import { ApplicationWithDetails } from "@shared/schema";

const noteSchema = z.object({
  content: z.string().min(1, { message: "Note content is required" }),
});

type NoteFormValues = z.infer<typeof noteSchema>;

interface ApplicationDetailModalProps {
  application: ApplicationWithDetails;
  onClose: () => void;
}

export function ApplicationDetailModal({ application, onClose }: ApplicationDetailModalProps) {
  const { toast } = useToast();
  const [status, setStatus] = useState(application.status);
  
  const noteForm = useForm<NoteFormValues>({
    resolver: zodResolver(noteSchema),
    defaultValues: {
      content: "",
    },
  });
  
  // Add note mutation
  const addNote = useMutation({
    mutationFn: async (values: NoteFormValues) => {
      const res = await apiRequest("POST", `/api/applications/${application.id}/notes`, values);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/applications"] });
      toast({
        title: "Note added",
        description: "Your note has been added to the application.",
      });
      noteForm.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to add note",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Update status mutation
  const updateStatus = useMutation({
    mutationFn: async (newStatus: string) => {
      const res = await apiRequest("PATCH", `/api/applications/${application.id}/status`, { status: newStatus });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/applications"] });
      toast({
        title: "Status updated",
        description: "Application status has been updated successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update status",
        description: error.message,
        variant: "destructive",
      });
      // Revert status
      setStatus(application.status);
    },
  });
  
  function onNoteSubmit(values: NoteFormValues) {
    addNote.mutate(values);
  }
  
  function handleStatusUpdate() {
    if (status !== application.status) {
      updateStatus.mutate(status);
    }
  }
  
  function downloadDocument(document: any) {
    const link = document.createElement('a');
    link.href = `data:${document.fileType};base64,${document.fileData}`;
    link.download = document.name;
    link.click();
  }
  
  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle>Application Details</DialogTitle>
        </DialogHeader>
        
        <div className="p-2">
          {/* Applicant and Application Info */}
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <h4 className="font-medium text-gray-500 mb-2">Applicant Information</h4>
              <div className="space-y-3">
                <div className="flex">
                  <span className="w-32 text-gray-600">Name:</span>
                  <span className="font-medium">
                    {application.applicant.firstName} {application.applicant.lastName}
                  </span>
                </div>
                <div className="flex">
                  <span className="w-32 text-gray-600">Email:</span>
                  <span>{application.applicant.email}</span>
                </div>
                <div className="flex">
                  <span className="w-32 text-gray-600">Phone:</span>
                  <span>{application.applicant.profile?.phone || "-"}</span>
                </div>
                <div className="flex">
                  <span className="w-32 text-gray-600">School:</span>
                  <span>{application.applicant.profile?.school || "-"}</span>
                </div>
                <div className="flex">
                  <span className="w-32 text-gray-600">Major:</span>
                  <span>{application.applicant.profile?.major || "-"}</span>
                </div>
                <div className="flex">
                  <span className="w-32 text-gray-600">GPA:</span>
                  <span>{application.applicant.profile?.gpa || "-"}</span>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-500 mb-2">Application Details</h4>
              <div className="space-y-3">
                <div className="flex">
                  <span className="w-32 text-gray-600">Scholarship:</span>
                  <span>{application.scholarship.name}</span>
                </div>
                <div className="flex">
                  <span className="w-32 text-gray-600">Status:</span>
                  <StatusBadge status={application.status} />
                </div>
                <div className="flex">
                  <span className="w-32 text-gray-600">Submitted:</span>
                  <span>{new Date(application.submittedAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Personal Statement */}
          <div className="mt-6">
            <h4 className="font-medium text-gray-500 mb-2">Personal Statement</h4>
            <div className="rounded-md border p-4 bg-gray-50">
              <p className="text-sm whitespace-pre-line">
                {application.personalStatement || "No personal statement provided."}
              </p>
            </div>
          </div>
          
          {/* Documents */}
          <div className="mt-6">
            <h4 className="font-medium text-gray-500 mb-2">Documents</h4>
            <div className="space-y-2">
              {application.documents && application.documents.length > 0 ? (
                application.documents.map((document) => (
                  <div key={document.id} className="flex items-center justify-between rounded-lg border p-3">
                    <div className="flex items-center space-x-3">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 text-gray-500">
                        <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path>
                        <polyline points="14 2 14 8 20 8"></polyline>
                      </svg>
                      <div>
                        <p className="font-medium">{document.name}</p>
                        <p className="text-xs text-gray-500">
                          Uploaded {new Date(document.uploadedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => downloadDocument(document)}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                        <polyline points="7 10 12 15 17 10"></polyline>
                        <line x1="12" x2="12" y1="15" y2="3"></line>
                      </svg>
                    </Button>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-gray-500">
                  No documents uploaded
                </div>
              )}
            </div>
          </div>
          
          {/* Reviewer Notes */}
          <div className="mt-6">
            <h4 className="font-medium text-gray-500 mb-2">Reviewer Notes</h4>
            <div className="space-y-3">
              {application.notes && application.notes.length > 0 ? (
                application.notes.map((note) => (
                  <div key={note.id} className="rounded-lg border p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-semibold text-sm">
                          {note.author.firstName.charAt(0)}
                          {note.author.lastName.charAt(0)}
                        </div>
                        <span className="font-medium">
                          {note.author.firstName} {note.author.lastName}
                        </span>
                        <span className="text-xs text-gray-500">
                          {new Date(note.createdAt).toLocaleDateString()} at{" "}
                          {new Date(note.createdAt).toLocaleTimeString()}
                        </span>
                      </div>
                    </div>
                    <p className="mt-2 text-sm">{note.content}</p>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-gray-500">
                  No reviewer notes yet
                </div>
              )}
              
              <div className="mt-3">
                <Form {...noteForm}>
                  <form onSubmit={noteForm.handleSubmit(onNoteSubmit)}>
                    <FormField
                      control={noteForm.control}
                      name="content"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Textarea 
                              rows={2} 
                              placeholder="Add a note..." 
                              className="w-full"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="mt-2 flex justify-end">
                      <Button type="submit" disabled={addNote.isPending}>
                        {addNote.isPending ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Adding
                          </>
                        ) : (
                          "Add Note"
                        )}
                      </Button>
                    </div>
                  </form>
                </Form>
              </div>
            </div>
          </div>
          
          {/* Status Update and Actions */}
          <div className="mt-6 border-t pt-6 flex items-center justify-between">
            <div>
              <h4 className="font-medium">Update Status</h4>
              <div className="mt-2 flex items-center gap-2">
                <Select 
                  value={status} 
                  onValueChange={setStatus}
                >
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="reviewing">Under Review</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
                
                <Button 
                  onClick={handleStatusUpdate}
                  disabled={status === application.status || updateStatus.isPending}
                >
                  {updateStatus.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Updating
                    </>
                  ) : (
                    "Update"
                  )}
                </Button>
              </div>
            </div>
            
            <div className="space-x-3">
              <Button variant="outline" onClick={onClose}>
                Close
              </Button>
              <Button>
                Save Changes
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
