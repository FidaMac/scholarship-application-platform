import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { MainLayout } from "@/components/main-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/status-badge";
import { ProfileCard } from "@/components/profile-card";
import { ApplicationForm } from "@/components/application-form";
import { DocumentUpload } from "@/components/document-upload";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Application, Document, Profile, Scholarship } from "@shared/schema";

export default function ApplicantDashboard() {
  const { user } = useAuth();
  const [showApplicationForm, setShowApplicationForm] = useState(false);
  
  // Fetch applicant's profile
  const { data: profile, isLoading: profileLoading } = useQuery<Profile>({
    queryKey: ["/api/profile"],
  });
  
  // Fetch all scholarships
  const { data: scholarships, isLoading: scholarshipsLoading } = useQuery<Scholarship[]>({
    queryKey: ["/api/scholarships"],
  });
  
  // Fetch applicant's applications
  const { data: applications, isLoading: applicationsLoading } = useQuery<Application[]>({
    queryKey: ["/api/applications"],
  });
  
  // Fetch applicant's documents
  const { data: documents, isLoading: documentsLoading } = useQuery<Document[]>({
    queryKey: ["/api/documents"],
  });
  
  const isLoading = profileLoading || scholarshipsLoading || applicationsLoading || documentsLoading;
  
  return (
    <MainLayout>
      <div className="container px-4 py-6 sm:px-6 lg:px-8">
        {/* Dashboard Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Applicant Dashboard</h1>
          <p className="mt-2 text-lg text-gray-600">
            Manage your scholarship applications and profile
          </p>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            {/* Dashboard Content */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {/* Application Status Card */}
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold">Application Status</h3>
                  {applications && applications.length > 0 ? (
                    <div className="mt-4 space-y-4">
                      {applications.map((application) => (
                        <div key={application.id} className="flex items-start justify-between rounded-lg border p-4">
                          <div className="space-y-1">
                            <p className="font-semibold">
                              {scholarships?.find(s => s.id === application.scholarshipId)?.name}
                            </p>
                            <p className="text-sm text-gray-500">
                              Updated: {application.updatedAt ? new Date(application.updatedAt).toLocaleDateString() : 'N/A'}
                            </p>
                          </div>
                          <StatusBadge status={application.status} />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="mt-4 text-center py-6 text-gray-500">
                      <p>No applications yet</p>
                    </div>
                  )}
                  <div className="mt-4">
                    <Button onClick={() => setShowApplicationForm(true)}>
                      New Application
                    </Button>
                    {/* Display help text to make it clear what happens */}
                    {showApplicationForm && (
                      <p className="text-xs text-gray-500 mt-2">
                        Please scroll down to see the application form
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
              
              {/* Profile Card */}
              <ProfileCard profile={profile} user={user} />
              
              {/* Documents Card */}
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold">Your Documents</h3>
                  
                  {documents && documents.length > 0 ? (
                    <div className="mt-4 space-y-4">
                      {documents.map((document) => (
                        <div 
                          key={document.id} 
                          className="flex items-center justify-between rounded-lg border p-4"
                        >
                          <div className="flex items-center space-x-3">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 text-gray-500">
                              <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path>
                              <polyline points="14 2 14 8 20 8"></polyline>
                            </svg>
                            <div>
                              <p className="font-medium">{document.name}</p>
                              <p className="text-xs text-gray-500">
                                Uploaded {document.uploadedAt ? new Date(document.uploadedAt).toLocaleDateString() : 'N/A'}
                              </p>
                            </div>
                          </div>
                          <Button variant="ghost" size="icon" asChild>
                            <a 
                              href={`data:${document.fileType};base64,${document.fileData}`}
                              download={document.name}
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                <polyline points="7 10 12 15 17 10"></polyline>
                                <line x1="12" x2="12" y1="15" y2="3"></line>
                              </svg>
                            </a>
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="mt-4 text-center py-6 text-gray-500">
                      <p>No documents uploaded</p>
                    </div>
                  )}
                  
                  <div className="mt-4">
                    <DocumentUpload />
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Application Form */}
            {showApplicationForm && (
              <div className="mt-8 pt-8 border-t border-gray-200">
                <h2 className="text-2xl font-bold mb-4 scroll-mt-16" id="application-form">
                  New Application Form
                </h2>
                <ApplicationForm 
                  scholarships={scholarships || []} 
                  onSubmitSuccess={() => setShowApplicationForm(false)} 
                  onCancel={() => setShowApplicationForm(false)}
                />
              </div>
            )}
          </>
        )}
      </div>
    </MainLayout>
  );
}
