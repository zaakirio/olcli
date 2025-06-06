import { ModelResponse, ChatRequest, ChatResponseChunk } from '../types.js';
export declare class OllamaService {
    private baseUrl;
    constructor(baseUrl?: string);
    getAvailableModels(): Promise<ModelResponse>;
    chatStream(request: ChatRequest): AsyncGenerator<ChatResponseChunk>;
    checkConnection(): Promise<boolean>;
    searchAvailableModels(query: string): Promise<string[]>;
    validateModelName(modelName: string): Promise<{
        isValid: boolean;
        suggestions: string[];
    }>;
    pullModel(modelName: string, onProgress?: (progress: number) => void): Promise<void>;
    getModels(): Promise<import("../types.js").OllamaModel[]>;
}
//# sourceMappingURL=ollama.d.ts.map