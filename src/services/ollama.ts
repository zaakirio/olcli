import { ModelResponse, ChatRequest, ChatResponseChunk } from '../types.js';

const OLLAMA_BASE_URL = 'http://localhost:11434';

export class OllamaService {
  private baseUrl: string;

  constructor(baseUrl: string = OLLAMA_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  async getAvailableModels(): Promise<ModelResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/tags`);
      if (!response.ok) {
        throw new Error(`Failed to fetch models: ${response.status} ${response.statusText}`);
      }
      return await response.json() as ModelResponse;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to connect to Ollama: ${error.message}`);
      }
      throw new Error('Failed to connect to Ollama: Unknown error');
    }
  }

  async *chatStream(request: ChatRequest): AsyncGenerator<ChatResponseChunk> {
    try {
      console.log(`Starting chat stream for model: ${request.model}`);
      
      const response = await fetch(`${this.baseUrl}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...request,
          stream: true,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Chat request failed for ${request.model}:`, response.status, response.statusText, errorText);
        throw new Error(`Chat request failed for ${request.model}: ${response.status} ${response.statusText} - ${errorText}`);
      }

      if (!response.body) {
        throw new Error(`No response body for ${request.model}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let chunkCount = 0;

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) {
            console.log(`Stream completed for ${request.model} after ${chunkCount} chunks`);
            break;
          }

          const chunk = decoder.decode(value);
          const lines = chunk.split('\n').filter(line => line.trim());

          for (const line of lines) {
            try {
              const data = JSON.parse(line) as ChatResponseChunk;
              chunkCount++;
              
              // Check for error in response
              if ('error' in data) {
                throw new Error(`Model error: ${(data as any).error}`);
              }
              
              yield data;
              if (data.done) {
                console.log(`Model ${request.model} completed response`);
                return;
              }
            } catch (parseError) {
              console.warn(`Failed to parse chunk for ${request.model}:`, line);
              // Continue processing other lines instead of failing
            }
          }
        }
      } finally {
        reader.releaseLock();
      }
    } catch (error) {
      console.error(`Chat stream error for ${request.model}:`, error);
      if (error instanceof Error) {
        throw new Error(`Chat stream failed for ${request.model}: ${error.message}`);
      }
      throw new Error(`Chat stream failed for ${request.model}: Unknown error`);
    }
  }

  async checkConnection(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/api/tags`);
      return response.ok;
    } catch {
      return false;
    }
  }

  async pullModel(modelName: string, onProgress?: (progress: number) => void): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/api/pull`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: modelName,
          stream: true,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Pull request failed: ${response.status} ${response.statusText} - ${errorText}`);
      }

      if (!response.body) {
        throw new Error('No response body for pull request');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split('\n').filter(line => line.trim());

          for (const line of lines) {
            try {
              const data = JSON.parse(line);
              
              if (data.error) {
                throw new Error(data.error);
              }

              // Calculate progress based on status
              if (data.status && onProgress) {
                if (data.status.includes('downloading')) {
                  // Extract progress from status message if available
                  const completed = data.completed || 0;
                  const total = data.total || 1;
                  const progress = Math.round((completed / total) * 90); // 90% for download
                  onProgress(progress);
                } else if (data.status.includes('verifying') || data.status.includes('writing')) {
                  onProgress(95);
                } else if (data.status.includes('success') || data.status === 'success') {
                  onProgress(100);
                  return;
                }
              }
            } catch (parseError) {
              console.warn('Failed to parse pull response chunk:', line);
            }
          }
        }
      } finally {
        reader.releaseLock();
      }
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to pull model '${modelName}': ${error.message}`);
      }
      throw new Error(`Failed to pull model '${modelName}': Unknown error`);
    }
  }

  async getModels() {
    const response = await this.getAvailableModels();
    return response.models;
  }
}