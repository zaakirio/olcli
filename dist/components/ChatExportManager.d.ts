import React from 'react';
import { ChatExport, ChatMessage, Profile, Template } from '../types.js';
interface ChatExportManagerProps {
    chatHistory: Map<string, ChatMessage[]>;
    selectedModels: string[];
    currentProfile?: Profile;
    currentTemplate?: Template;
    onImportChat: (chatData: ChatExport) => void;
    onBack: () => void;
    onError: (error: string) => void;
    onSuccess: (message: string) => void;
}
export declare const ChatExportManager: React.FC<ChatExportManagerProps>;
export {};
//# sourceMappingURL=ChatExportManager.d.ts.map