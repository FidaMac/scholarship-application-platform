import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import multer from "multer";
import { insertApplicationSchema, insertProfileSchema, insertNoteSchema, InsertDocument } from "@shared/schema";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";

// Multer setup for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});

// Helper function for handling validation errors
function handleValidationError(error: unknown, res: Response) {
  if (error instanceof ZodError) {
    const validationError = fromZodError(error);
    return res.status(400).json({ message: validationError.message });
  }
  console.error(error);
  return res.status(500).json({ message: "Internal server error" });
}

// Helper function for checking authentication
function isAuthenticated(req: Request, res: Response, next: Function) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: "Unauthorized" });
}

// Helper function for checking admin role
function isAdmin(req: Request, res: Response, next: Function) {
  if (req.isAuthenticated() && req.user.role === "admin") {
    return next();
  }
  res.status(403).json({ message: "Forbidden - Admin access required" });
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication routes (/api/register, /api/login, /api/logout, /api/user)
  setupAuth(app);
  
  // Profile routes
  app.get("/api/profile", isAuthenticated, async (req, res) => {
    try {
      const profile = await storage.getProfileByUserId(req.user!.id);
      if (!profile) {
        return res.status(404).json({ message: "Profile not found" });
      }
      res.json(profile);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Failed to fetch profile" });
    }
  });
  
  app.post("/api/profile", isAuthenticated, async (req, res) => {
    try {
      const parsedData = insertProfileSchema.parse({
        ...req.body,
        userId: req.user!.id
      });
      
      const existingProfile = await storage.getProfileByUserId(req.user!.id);
      
      if (existingProfile) {
        const updatedProfile = await storage.updateProfile(existingProfile.id, parsedData);
        return res.json(updatedProfile);
      }
      
      const profile = await storage.createProfile(parsedData);
      res.status(201).json(profile);
    } catch (error) {
      handleValidationError(error, res);
    }
  });
  
  // Scholarship routes
  app.get("/api/scholarships", async (req, res) => {
    try {
      const scholarships = await storage.getScholarships();
      res.json(scholarships);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Failed to fetch scholarships" });
    }
  });
  
  // Admin only - Create scholarship
  app.post("/api/scholarships", isAdmin, async (req, res) => {
    try {
      const scholarship = await storage.createScholarship(req.body);
      res.status(201).json(scholarship);
    } catch (error) {
      handleValidationError(error, res);
    }
  });
  
  // Application routes
  app.get("/api/applications", isAuthenticated, async (req, res) => {
    try {
      // If admin, return all applications with details
      if (req.user!.role === "admin") {
        const applications = await storage.getApplicationsWithDetails();
        return res.json(applications);
      }
      
      // Otherwise return only user's applications
      const applications = await storage.getApplicationsByUserId(req.user!.id);
      
      // Enrich with scholarship details
      const enrichedApplications = await Promise.all(
        applications.map(async (app) => {
          const details = await storage.getApplicationWithDetails(app.id);
          return details;
        })
      );
      
      res.json(enrichedApplications);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Failed to fetch applications" });
    }
  });
  
  app.get("/api/applications/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const application = await storage.getApplicationWithDetails(id);
      
      if (!application) {
        return res.status(404).json({ message: "Application not found" });
      }
      
      // Check if user is admin or the application owner
      if (req.user!.role !== "admin" && application.userId !== req.user!.id) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      res.json(application);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Failed to fetch application" });
    }
  });
  
  app.post("/api/applications", isAuthenticated, async (req, res) => {
    try {
      const parsedData = insertApplicationSchema.parse({
        ...req.body,
        userId: req.user!.id
      });
      
      const application = await storage.createApplication(parsedData);
      res.status(201).json(application);
    } catch (error) {
      handleValidationError(error, res);
    }
  });
  
  // Admin only - Update application status
  app.patch("/api/applications/:id/status", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { status } = req.body;
      
      if (!["pending", "reviewing", "approved", "rejected"].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }
      
      const application = await storage.updateApplicationStatus(id, status);
      
      if (!application) {
        return res.status(404).json({ message: "Application not found" });
      }
      
      res.json(application);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Failed to update application status" });
    }
  });
  
  // Document routes
  app.get("/api/documents", isAuthenticated, async (req, res) => {
    try {
      const documents = await storage.getDocumentsByUserId(req.user!.id);
      res.json(documents);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Failed to fetch documents" });
    }
  });
  
  app.post("/api/documents", isAuthenticated, upload.single("file"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }
      
      const file = req.file;
      const { applicationId } = req.body;
      
      // Convert file to base64 for storage
      const fileData = file.buffer.toString("base64");
      
      const document: InsertDocument = {
        userId: req.user!.id,
        applicationId: applicationId ? parseInt(applicationId) : null,
        name: file.originalname,
        fileType: file.mimetype,
        fileData,
      };
      
      const savedDocument = await storage.createDocument(document);
      res.status(201).json(savedDocument);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Failed to upload document" });
    }
  });
  
  app.delete("/api/documents/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const document = await storage.documents.get(id);
      
      if (!document) {
        return res.status(404).json({ message: "Document not found" });
      }
      
      // Check if user is admin or document owner
      if (req.user!.role !== "admin" && document.userId !== req.user!.id) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      const success = await storage.deleteDocument(id);
      
      if (!success) {
        return res.status(500).json({ message: "Failed to delete document" });
      }
      
      res.status(204).send();
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Failed to delete document" });
    }
  });
  
  // Note routes (admin only)
  app.post("/api/applications/:id/notes", isAdmin, async (req, res) => {
    try {
      const applicationId = parseInt(req.params.id);
      
      const parsedData = insertNoteSchema.parse({
        applicationId,
        userId: req.user!.id,
        content: req.body.content
      });
      
      const note = await storage.createNote(parsedData);
      res.status(201).json(note);
    } catch (error) {
      handleValidationError(error, res);
    }
  });
  
  // Export applications (admin only)
  app.get("/api/export/applications", isAdmin, async (req, res) => {
    try {
      const applications = await storage.getApplicationsWithDetails();
      
      // Convert to CSV format
      const headers = [
        "ID", "Applicant", "Email", "Scholarship", "Status", 
        "GPA", "School", "Major", "Submitted Date"
      ];
      
      const rows = applications.map(app => [
        app.id,
        `${app.applicant.firstName} ${app.applicant.lastName}`,
        app.applicant.email,
        app.scholarship.name,
        app.status,
        app.applicant.profile?.gpa || "",
        app.applicant.profile?.school || "",
        app.applicant.profile?.major || "",
        app.submittedAt.toISOString().split("T")[0]
      ]);
      
      const csv = [
        headers.join(","),
        ...rows.map(row => row.join(","))
      ].join("\n");
      
      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", "attachment; filename=applications.csv");
      res.send(csv);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Failed to export applications" });
    }
  });
  
  const httpServer = createServer(app);
  
  return httpServer;
}
