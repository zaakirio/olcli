import React from 'react';
import { ModelStatus, ChatMessage } from '../types.js';
interface ModelPanelProps {
    model: ModelStatus;
    messages: ChatMessage[];
    streamingContent: string;
    onUpdateStatus: (modelName: string, status: ModelStatus['status'], error?: string) => void;
    onAddMessage: (modelName: string, message: ChatMessage) => void;
    onStreamingUpdate: (modelName: string, content: string) => void;
    onError: (error: string) => void;
}
export declare const ModelPanel: React.FC<ModelPanelProps>;
export {};
//# sourceMappingURL=ModelPanel.d.ts.map