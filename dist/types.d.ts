export interface OllamaModel {
    name: string;
    size: number;
    digest: string;
    modified_at: string;
    details?: {
        format?: string;
        family?: string;
        families?: string[];
        parameter_size?: string;
        quantization_level?: string;
    };
}
export interface ModelResponse {
    models: OllamaModel[];
}
export interface ChatMessage {
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp?: number;
}
export interface ChatRequest {
    model: string;
    messages: ChatMessage[];
    stream?: boolean;
}
export interface ChatResponseChunk {
    model: string;
    created_at: string;
    message: {
        role: string;
        content: string;
    };
    done: boolean;
}
export interface ModelStatus {
    name: string;
    status: 'loading' | 'ready' | 'responding' | 'error' | 'idle';
    error?: string;
    responseTime?: number;
    isSelected: boolean;
}
export interface Profile {
    id: string;
    name: string;
    description: string;
    systemPrompt: string;
    createdAt: number;
    isBuiltIn?: boolean;
}
export interface Template {
    id: string;
    name: string;
    description: string;
    modelNames: string[];
    createdAt: number;
    isBuiltIn?: boolean;
}
export interface ChatExport {
    id: string;
    name: string;
    timestamp: number;
    profile?: Profile;
    template?: Template;
    models: string[];
    messages: Record<string, ChatMessage[]>;
}
export interface ModelInstallRequest {
    name: string;
    progress?: number;
    status: 'downloading' | 'installing' | 'completed' | 'error';
    error?: string;
}
export interface AppState {
    models: OllamaModel[];
    selectedModels: ModelStatus[];
    currentInput: string;
    chatHistory: Map<string, ChatMessage[]>;
    isLoading: boolean;
    error?: string;
    view: 'model-selection' | 'chat' | 'profiles' | 'templates' | 'model-install' | 'chat-export';
    currentProfile?: Profile;
    currentTemplate?: Template;
}
//# sourceMappingURL=types.d.ts.map