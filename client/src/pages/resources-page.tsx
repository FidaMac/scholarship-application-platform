import { MainLayout } from "@/components/main-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, BookOpen, Download, ExternalLink } from "lucide-react";

export default function ResourcesPage() {
  const resources = [
    {
      title: "Scholarship Application Guide",
      description: "A comprehensive guide to help you create a strong scholarship application.",
      icon: <FileText className="h-8 w-8 text-primary" />,
      link: "#",
    },
    {
      title: "Essay Writing Tips",
      description: "Learn how to write compelling personal statements that stand out.",
      icon: <BookOpen className="h-8 w-8 text-primary" />,
      link: "#",
    },
    {
      title: "Financial Aid Resources",
      description: "Additional resources for finding financial support for your education.",
      icon: <Download className="h-8 w-8 text-primary" />,
      link: "#",
    },
  ];

  const externalResources = [
    {
      title: "FAFSA",
      description: "Free Application for Federal Student Aid",
      url: "https://studentaid.gov/",
    },
    {
      title: "Scholarships.com",
      description: "Search for more scholarship opportunities",
      url: "https://www.scholarships.com",
    },
    {
      title: "College Board",
      description: "Information on college planning and financial aid",
      url: "https://www.collegeboard.org",
    },
  ];

  return (
    <MainLayout>
      <div className="container px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Scholarship Resources</h1>
          <p className="mt-2 text-lg text-gray-600">
            Helpful materials to improve your scholarship applications
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {resources.map((resource, index) => (
            <Card key={index}>
              <CardHeader>
                <div className="flex items-center gap-3">
                  {resource.icon}
                  <CardTitle>{resource.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="mb-4">{resource.description}</CardDescription>
                <Button>View Resource</Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <h2 className="text-2xl font-bold mt-12 mb-6">External Resources</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {externalResources.map((resource, index) => (
            <Card key={index}>
              <CardHeader>
                <CardTitle>{resource.title}</CardTitle>
                <CardDescription>{resource.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full" asChild>
                  <a href={resource.url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2">
                    Visit Website <ExternalLink className="h-4 w-4" />
                  </a>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </MainLayout>
  );
}