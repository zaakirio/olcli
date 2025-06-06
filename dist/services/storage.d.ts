import { Profile, Template, ChatExport } from '../types.js';
export declare class StorageService {
    constructor();
    private ensureDirectories;
    private initializeBuiltIns;
    getProfiles(): Profile[];
    saveProfiles(profiles: Profile[]): void;
    addProfile(profile: Omit<Profile, 'id' | 'createdAt'>): Profile;
    deleteProfile(id: string): boolean;
    getTemplates(): Template[];
    saveTemplates(templates: Template[]): void;
    addTemplate(template: Omit<Template, 'id' | 'createdAt'>): Template;
    deleteTemplate(id: string): boolean;
    exportChat(chatExport: Omit<ChatExport, 'id'>): string;
    importChat(filepath: string): ChatExport;
    getExportedChats(): string[];
    private generateId;
}
//# sourceMappingURL=storage.d.ts.map