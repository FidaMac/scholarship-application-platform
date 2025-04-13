import { User, InsertUser, Profile, InsertProfile, Scholarship, InsertScholarship, 
  Application, InsertApplication, Document, InsertDocument, Note, InsertNote, 
  ApplicationWithDetails } from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Profile methods
  getProfileByUserId(userId: number): Promise<Profile | undefined>;
  createProfile(profile: InsertProfile): Promise<Profile>;
  updateProfile(id: number, profile: Partial<Profile>): Promise<Profile | undefined>;
  
  // Scholarship methods
  getScholarships(): Promise<Scholarship[]>;
  getScholarship(id: number): Promise<Scholarship | undefined>;
  createScholarship(scholarship: InsertScholarship): Promise<Scholarship>;
  
  // Application methods
  getApplicationsByUserId(userId: number): Promise<Application[]>;
  getApplicationsWithDetails(): Promise<ApplicationWithDetails[]>;
  getApplicationWithDetails(id: number): Promise<ApplicationWithDetails | undefined>;
  createApplication(application: InsertApplication): Promise<Application>;
  updateApplicationStatus(id: number, status: string): Promise<Application | undefined>;
  
  // Document methods
  getDocumentsByUserId(userId: number): Promise<Document[]>;
  getDocumentsByApplicationId(applicationId: number): Promise<Document[]>;
  createDocument(document: InsertDocument): Promise<Document>;
  deleteDocument(id: number): Promise<boolean>;
  
  // Note methods
  getNotesByApplicationId(applicationId: number): Promise<Note[]>;
  createNote(note: InsertNote): Promise<Note>;
  
  // Session store
  sessionStore: session.SessionStore;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private profiles: Map<number, Profile>;
  private scholarships: Map<number, Scholarship>;
  private applications: Map<number, Application>;
  private documents: Map<number, Document>;
  private notes: Map<number, Note>;
  
  sessionStore: session.SessionStore;
  
  private userIdCounter: number;
  private profileIdCounter: number;
  private scholarshipIdCounter: number;
  private applicationIdCounter: number;
  private documentIdCounter: number;
  private noteIdCounter: number;
  
  constructor() {
    this.users = new Map();
    this.profiles = new Map();
    this.scholarships = new Map();
    this.applications = new Map();
    this.documents = new Map();
    this.notes = new Map();
    
    this.userIdCounter = 1;
    this.profileIdCounter = 1;
    this.scholarshipIdCounter = 1;
    this.applicationIdCounter = 1;
    this.documentIdCounter = 1;
    this.noteIdCounter = 1;
    
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000,
    });
    
    // Create default scholarships
    this.createDefaultScholarships();
    // Create admin user
    this.createAdminUser();
  }
  
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email.toLowerCase() === email.toLowerCase(),
    );
  }
  
  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const createdAt = new Date();
    const user: User = { ...insertUser, id, createdAt };
    this.users.set(id, user);
    return user;
  }
  
  // Profile methods
  async getProfileByUserId(userId: number): Promise<Profile | undefined> {
    return Array.from(this.profiles.values()).find(
      (profile) => profile.userId === userId,
    );
  }
  
  async createProfile(insertProfile: InsertProfile): Promise<Profile> {
    const id = this.profileIdCounter++;
    const updatedAt = new Date();
    const profile: Profile = { ...insertProfile, id, updatedAt };
    this.profiles.set(id, profile);
    return profile;
  }
  
  async updateProfile(id: number, profileUpdate: Partial<Profile>): Promise<Profile | undefined> {
    const profile = this.profiles.get(id);
    if (!profile) return undefined;
    
    const updatedProfile = { ...profile, ...profileUpdate, updatedAt: new Date() };
    this.profiles.set(id, updatedProfile);
    return updatedProfile;
  }
  
  // Scholarship methods
  async getScholarships(): Promise<Scholarship[]> {
    return Array.from(this.scholarships.values());
  }
  
  async getScholarship(id: number): Promise<Scholarship | undefined> {
    return this.scholarships.get(id);
  }
  
  async createScholarship(insertScholarship: InsertScholarship): Promise<Scholarship> {
    const id = this.scholarshipIdCounter++;
    const createdAt = new Date();
    const scholarship: Scholarship = { ...insertScholarship, id, createdAt };
    this.scholarships.set(id, scholarship);
    return scholarship;
  }
  
  // Application methods
  async getApplicationsByUserId(userId: number): Promise<Application[]> {
    return Array.from(this.applications.values()).filter(
      (application) => application.userId === userId,
    );
  }
  
  async getApplicationsWithDetails(): Promise<ApplicationWithDetails[]> {
    return await Promise.all(
      Array.from(this.applications.values()).map(async (application) => {
        return this.enrichApplicationWithDetails(application);
      })
    );
  }
  
  async getApplicationWithDetails(id: number): Promise<ApplicationWithDetails | undefined> {
    const application = this.applications.get(id);
    if (!application) return undefined;
    
    return this.enrichApplicationWithDetails(application);
  }
  
  async createApplication(insertApplication: InsertApplication): Promise<Application> {
    const id = this.applicationIdCounter++;
    const submittedAt = new Date();
    const updatedAt = new Date();
    const status = "pending";
    const application: Application = { 
      ...insertApplication, 
      id, 
      status, 
      submittedAt, 
      updatedAt 
    };
    this.applications.set(id, application);
    return application;
  }
  
  async updateApplicationStatus(id: number, status: string): Promise<Application | undefined> {
    const application = this.applications.get(id);
    if (!application) return undefined;
    
    const updatedApplication = { 
      ...application, 
      status, 
      updatedAt: new Date() 
    };
    this.applications.set(id, updatedApplication);
    return updatedApplication;
  }
  
  // Document methods
  async getDocumentsByUserId(userId: number): Promise<Document[]> {
    return Array.from(this.documents.values()).filter(
      (document) => document.userId === userId,
    );
  }
  
  async getDocumentsByApplicationId(applicationId: number): Promise<Document[]> {
    return Array.from(this.documents.values()).filter(
      (document) => document.applicationId === applicationId,
    );
  }
  
  async createDocument(insertDocument: InsertDocument): Promise<Document> {
    const id = this.documentIdCounter++;
    const uploadedAt = new Date();
    const document: Document = { ...insertDocument, id, uploadedAt };
    this.documents.set(id, document);
    return document;
  }
  
  async deleteDocument(id: number): Promise<boolean> {
    return this.documents.delete(id);
  }
  
  // Note methods
  async getNotesByApplicationId(applicationId: number): Promise<Note[]> {
    return Array.from(this.notes.values()).filter(
      (note) => note.applicationId === applicationId,
    );
  }
  
  async createNote(insertNote: InsertNote): Promise<Note> {
    const id = this.noteIdCounter++;
    const createdAt = new Date();
    const note: Note = { ...insertNote, id, createdAt };
    this.notes.set(id, note);
    return note;
  }
  
  // Helper functions
  private async enrichApplicationWithDetails(application: Application): Promise<ApplicationWithDetails> {
    const scholarship = (await this.getScholarship(application.scholarshipId))!;
    const applicant = (await this.getUser(application.userId))!;
    const profile = await this.getProfileByUserId(applicant.id);
    const documents = await this.getDocumentsByApplicationId(application.id);
    
    const notesData = await this.getNotesByApplicationId(application.id);
    const notes = await Promise.all(
      notesData.map(async (note) => {
        const author = (await this.getUser(note.userId))!;
        return { ...note, author };
      })
    );
    
    return {
      ...application,
      scholarship,
      applicant: { ...applicant, profile },
      documents,
      notes,
    };
  }
  
  // Initialize default data
  private async createDefaultScholarships() {
    await this.createScholarship({
      name: "STEM Excellence Scholarship",
      description: "Awarded to outstanding students in Science, Technology, Engineering, and Mathematics fields."
    });
    
    await this.createScholarship({
      name: "Diversity in Tech Grant",
      description: "Supporting underrepresented groups in technology and computing disciplines."
    });
    
    await this.createScholarship({
      name: "Community Leadership Award",
      description: "Recognizes students who demonstrate exceptional leadership in community service."
    });
    
    await this.createScholarship({
      name: "Academic Excellence Scholarship",
      description: "For students with outstanding academic achievements and high GPA."
    });
    
    await this.createScholarship({
      name: "Future Leaders Program",
      description: "Designed for students showing exceptional leadership potential."
    });
    
    await this.createScholarship({
      name: "Arts & Humanities Fellowship",
      description: "Supporting talented students in arts, literature, and humanities."
    });
  }
  
  private async createAdminUser() {
    await this.createUser({
      email: "admin@scholarships.com",
      password: "admin_pass_to_be_hashed", // This will be hashed in auth.ts
      firstName: "Admin",
      lastName: "User",
      role: "admin"
    });
  }
}

export const storage = new MemStorage();
