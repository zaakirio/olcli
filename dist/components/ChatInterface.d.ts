import React from 'react';
import { ModelStatus, ChatMessage, Profile } from '../types.js';
interface ChatInterfaceProps {
    selectedModels: ModelStatus[];
    currentProfile?: Profile;
    chatHistory: Map<string, ChatMessage[]>;
    onChatHistoryChange: (history: Map<string, ChatMessage[]>) => void;
    onBack: () => void;
    onError: (error: string) => void;
}
export declare const ChatInterface: React.FC<ChatInterfaceProps>;
export {};
//# sourceMappingURL=ChatInterface.d.ts.map