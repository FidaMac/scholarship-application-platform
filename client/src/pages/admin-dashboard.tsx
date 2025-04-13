import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { MainLayout } from "@/components/main-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StatusBadge } from "@/components/status-badge";
import { ApplicationDetailModal } from "@/components/application-detail-modal";
import { Loader2, Download, Search, Plus, Filter } from "lucide-react";
import { ApplicationWithDetails, Scholarship } from "@shared/schema";

export default function AdminDashboard() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [scholarshipFilter, setScholarshipFilter] = useState("all");
  const [selectedApplicationId, setSelectedApplicationId] = useState<number | null>(null);
  
  // Fetch all applications with details for admin
  const { data: applications, isLoading: applicationsLoading } = useQuery<ApplicationWithDetails[]>({
    queryKey: ["/api/applications"],
  });
  
  // Fetch all scholarships for filtering
  const { data: scholarships, isLoading: scholarshipsLoading } = useQuery<Scholarship[]>({
    queryKey: ["/api/scholarships"],
  });
  
  const isLoading = applicationsLoading || scholarshipsLoading;
  
  // Get the selected application for the detail modal
  const selectedApplication = applications?.find(app => app.id === selectedApplicationId) || null;
  
  // Filter applications based on search term and filters
  const filteredApplications = applications?.filter(app => {
    const matchesSearch = 
      searchTerm === "" || 
      app.applicant.firstName.toLowerCase().includes(searchTerm.toLowerCase()) || 
      app.applicant.lastName.toLowerCase().includes(searchTerm.toLowerCase()) || 
      app.applicant.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.scholarship.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || app.status === statusFilter;
    const matchesScholarship = scholarshipFilter === "all" || app.scholarshipId.toString() === scholarshipFilter;
    
    return matchesSearch && matchesStatus && matchesScholarship;
  });
  
  // Handle export to CSV
  const handleExport = () => {
    window.location.href = "/api/export/applications";
  };
  
  return (
    <MainLayout>
      <div className="container px-4 py-6 sm:px-6 lg:px-8">
        {/* Admin Dashboard Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
            <p className="mt-2 text-lg text-gray-600">
              Manage scholarship applications and applicants
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="outline" onClick={handleExport}>
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Scholarship
            </Button>
          </div>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Search & Filter */}
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
                  <div className="w-full md:w-1/3">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                      <Input
                        placeholder="Search applicants..."
                        className="pl-10"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="flex flex-col gap-4 sm:flex-row">
                    <Select
                      value={scholarshipFilter}
                      onValueChange={setScholarshipFilter}
                    >
                      <SelectTrigger className="w-[200px]">
                        <SelectValue placeholder="All Scholarships" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Scholarships</SelectItem>
                        {scholarships?.map(scholarship => (
                          <SelectItem key={scholarship.id} value={scholarship.id.toString()}>
                            {scholarship.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    
                    <Select
                      value={statusFilter}
                      onValueChange={setStatusFilter}
                    >
                      <SelectTrigger className="w-[150px]">
                        <SelectValue placeholder="All Statuses" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="reviewing">Under Review</SelectItem>
                        <SelectItem value="approved">Approved</SelectItem>
                        <SelectItem value="rejected">Rejected</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    <Button variant="secondary" size="sm">
                      <Filter className="mr-2 h-4 w-4" />
                      More Filters
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Applicants Table */}
            <Card>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      <th className="px-4 py-3">Applicant</th>
                      <th className="px-4 py-3">Scholarship</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Submitted</th>
                      <th className="px-4 py-3">GPA</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {filteredApplications?.length ? (
                      filteredApplications.map(application => (
                        <tr key={application.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3">
                            <div className="flex items-center">
                              <div className="h-10 w-10 flex-shrink-0 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-semibold">
                                {application.applicant.firstName.charAt(0)}
                                {application.applicant.lastName.charAt(0)}
                              </div>
                              <div className="ml-4">
                                <div className="font-medium">
                                  {application.applicant.firstName} {application.applicant.lastName}
                                </div>
                                <div className="text-gray-500 text-xs">
                                  {application.applicant.email}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3">{application.scholarship.name}</td>
                          <td className="px-4 py-3">
                            <StatusBadge status={application.status} />
                          </td>
                          <td className="px-4 py-3 text-gray-500 text-sm">
                            {new Date(application.submittedAt).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-3 text-gray-500 text-sm">
                            {application.applicant.profile?.gpa || "-"}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex justify-end space-x-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setSelectedApplicationId(application.id)}
                                title="View Details"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                                  <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path>
                                  <circle cx="12" cy="12" r="3"></circle>
                                </svg>
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                title="Edit"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                                  <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"></path>
                                  <path d="m15 5 4 4"></path>
                                </svg>
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                title="Add Note"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                                  <line x1="12" x2="12" y1="11" y2="17"></line>
                                  <line x1="9" x2="15" y1="14" y2="14"></line>
                                  <rect width="18" height="18" x="3" y="3" rx="2" ry="2"></rect>
                                </svg>
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="px-4 py-6 text-center text-gray-500">
                          No applications found matching your criteria
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              <div className="flex items-center justify-between border-t px-4 py-3">
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-700">
                    Showing <span className="font-medium">1</span> to <span className="font-medium">{filteredApplications?.length || 0}</span> of{" "}
                    <span className="font-medium">{applications?.length || 0}</span> results
                  </span>
                </div>
                <div className="flex space-x-1">
                  <Button variant="outline" size="sm" disabled>
                    Previous
                  </Button>
                  <Button variant="outline" size="sm" className="bg-primary-50 text-primary">
                    1
                  </Button>
                  <Button variant="outline" size="sm" disabled>
                    Next
                  </Button>
                </div>
              </div>
            </Card>
            
            {/* Application Detail Modal */}
            {selectedApplication && (
              <ApplicationDetailModal
                application={selectedApplication}
                onClose={() => setSelectedApplicationId(null)}
              />
            )}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
