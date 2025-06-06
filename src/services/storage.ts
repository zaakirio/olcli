import fs from 'fs';
import path from 'path';
import os from 'os';
import { Profile, Template, ChatExport } from '../types.js';

const APP_DIR = path.join(os.homedir(), '.ollama-multi-chat');
const PROFILES_FILE = path.join(APP_DIR, 'profiles.json');
const TEMPLATES_FILE = path.join(APP_DIR, 'templates.json');
const EXPORTS_DIR = path.join(APP_DIR, 'exports');

export class StorageService {
  constructor() {
    this.ensureDirectories();
    this.initializeBuiltIns();
  }

  private ensureDirectories() {
    if (!fs.existsSync(APP_DIR)) {
      fs.mkdirSync(APP_DIR, { recursive: true });
    }
    if (!fs.existsSync(EXPORTS_DIR)) {
      fs.mkdirSync(EXPORTS_DIR, { recursive: true });
    }
  }

  private initializeBuiltIns() {
    // Initialize built-in profiles if they don't exist
    if (!fs.existsSync(PROFILES_FILE)) {
      const builtInProfiles: Profile[] = [
        {
          id: 'architect',
          name: 'Senior Solutions Architect',
          description: 'Expert in system design and architecture',
          systemPrompt: 'You are a senior solutions architect with 15+ years of experience. You excel at designing scalable, maintainable systems and explaining complex technical concepts clearly. Always consider performance, security, and maintainability in your recommendations.',
          createdAt: Date.now(),
          isBuiltIn: true,
        },
        {
          id: 'developer',
          name: 'Full-Stack Developer',
          description: 'Experienced developer across the stack',
          systemPrompt: 'You are an experienced full-stack developer who writes clean, efficient code. You follow best practices and can work with multiple technologies. You provide practical solutions and explain your reasoning.',
          createdAt: Date.now(),
          isBuiltIn: true,
        },
        {
          id: 'reviewer',
          name: 'Code Reviewer',
          description: 'Focus on code quality and best practices',
          systemPrompt: 'You are an expert code reviewer. You focus on code quality, security, performance, and maintainability. You provide constructive feedback and suggest improvements while explaining the reasoning behind your recommendations.',
          createdAt: Date.now(),
          isBuiltIn: true,
        },
        {
          id: 'teacher',
          name: 'Technical Teacher',
          description: 'Explain concepts clearly for learning',
          systemPrompt: 'You are a patient and knowledgeable technical teacher. You break down complex concepts into simple, understandable parts. You use examples and analogies to help students learn effectively.',
          createdAt: Date.now(),
          isBuiltIn: true,
        },
      ];
      this.saveProfiles(builtInProfiles);
    }

    // Initialize built-in templates if they don't exist
    if (!fs.existsSync(TEMPLATES_FILE)) {
      const builtInTemplates: Template[] = [
        {
          id: 'general',
          name: 'General Purpose',
          description: 'Balanced set of models for general use',
          modelNames: ['llama3.2:3b', 'phi3:mini', 'qwen2.5:7b'],
          createdAt: Date.now(),
          isBuiltIn: true,
        },
        {
          id: 'coding',
          name: 'Code Assistant',
          description: 'Models optimized for coding tasks',
          modelNames: ['deepseek-coder:6.7b', 'codellama:7b', 'starcoder2:3b'],
          createdAt: Date.now(),
          isBuiltIn: true,
        },
        {
          id: 'creative',
          name: 'Creative Writing',
          description: 'Models for creative and literary tasks',
          modelNames: ['llama3.2:3b', 'mistral:7b', 'gemma2:9b'],
          createdAt: Date.now(),
          isBuiltIn: true,
        },
        {
          id: 'analysis',
          name: 'Data Analysis',
          description: 'Models for analytical and research tasks',
          modelNames: ['qwen2.5:7b', 'llama3.1:8b', 'phi3:medium'],
          createdAt: Date.now(),
          isBuiltIn: true,
        },
      ];
      this.saveTemplates(builtInTemplates);
    }
  }

  // Profile management
  getProfiles(): Profile[] {
    try {
      if (!fs.existsSync(PROFILES_FILE)) return [];
      const data = fs.readFileSync(PROFILES_FILE, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error('Error loading profiles:', error);
      return [];
    }
  }

  saveProfiles(profiles: Profile[]): void {
    try {
      fs.writeFileSync(PROFILES_FILE, JSON.stringify(profiles, null, 2));
    } catch (error) {
      console.error('Error saving profiles:', error);
      throw error;
    }
  }

  addProfile(profile: Omit<Profile, 'id' | 'createdAt'>): Profile {
    const profiles = this.getProfiles();
    const newProfile: Profile = {
      ...profile,
      id: this.generateId(),
      createdAt: Date.now(),
    };
    profiles.push(newProfile);
    this.saveProfiles(profiles);
    return newProfile;
  }

  deleteProfile(id: string): boolean {
    const profiles = this.getProfiles();
    const filteredProfiles = profiles.filter(p => p.id !== id || p.isBuiltIn);
    if (filteredProfiles.length < profiles.length) {
      this.saveProfiles(filteredProfiles);
      return true;
    }
    return false;
  }

  // Template management
  getTemplates(): Template[] {
    try {
      if (!fs.existsSync(TEMPLATES_FILE)) return [];
      const data = fs.readFileSync(TEMPLATES_FILE, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error('Error loading templates:', error);
      return [];
    }
  }

  saveTemplates(templates: Template[]): void {
    try {
      fs.writeFileSync(TEMPLATES_FILE, JSON.stringify(templates, null, 2));
    } catch (error) {
      console.error('Error saving templates:', error);
      throw error;
    }
  }

  addTemplate(template: Omit<Template, 'id' | 'createdAt'>): Template {
    const templates = this.getTemplates();
    const newTemplate: Template = {
      ...template,
      id: this.generateId(),
      createdAt: Date.now(),
    };
    templates.push(newTemplate);
    this.saveTemplates(templates);
    return newTemplate;
  }

  deleteTemplate(id: string): boolean {
    const templates = this.getTemplates();
    const filteredTemplates = templates.filter(t => t.id !== id || t.isBuiltIn);
    if (filteredTemplates.length < templates.length) {
      this.saveTemplates(filteredTemplates);
      return true;
    }
    return false;
  }

  // Chat export/import
  exportChat(chatExport: Omit<ChatExport, 'id'>): string {
    const exportData: ChatExport = {
      ...chatExport,
      id: this.generateId(),
    };
    
    const filename = `chat-${exportData.name.replace(/[^a-zA-Z0-9]/g, '_')}-${Date.now()}.json`;
    const filepath = path.join(EXPORTS_DIR, filename);
    
    try {
      fs.writeFileSync(filepath, JSON.stringify(exportData, null, 2));
      return filepath;
    } catch (error) {
      console.error('Error exporting chat:', error);
      throw error;
    }
  }

  importChat(filepath: string): ChatExport {
    try {
      const data = fs.readFileSync(filepath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error('Error importing chat:', error);
      throw error;
    }
  }

  getExportedChats(): string[] {
    try {
      return fs.readdirSync(EXPORTS_DIR)
        .filter(file => file.endsWith('.json'))
        .map(file => path.join(EXPORTS_DIR, file));
    } catch (error) {
      console.error('Error listing exported chats:', error);
      return [];
    }
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }
}