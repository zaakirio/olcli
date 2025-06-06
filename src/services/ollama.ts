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

  async searchAvailableModels(query: string): Promise<string[]> {
    try {
      // First, try to fetch from Ollama library API to get available models
      const response = await fetch('https://registry.ollama.ai/api/models');
      if (response.ok) {
        const data = await response.json() as { models?: Array<{ name: string }> };
        if (data.models && Array.isArray(data.models)) {
          return data.models
            .filter((model) => 
              model.name && model.name.toLowerCase().includes(query.toLowerCase())
            )
            .map((model) => model.name)
            .slice(0, 10); // Limit to 10 suggestions
        }
      }
    } catch {
      // Fallback to common model patterns if API fails
    }

    // Fallback suggestions based on common model patterns
    const commonModels = [
      'llama3.2:3b', 'llama3.2:1b', 'llama3.1:8b', 'llama3.1:70b',
      'phi3:mini', 'phi3:medium', 'phi3.5:3.8b',
      'qwen2.5:7b', 'qwen2.5:14b', 'qwen2.5:32b',
      'mistral:7b', 'mistral:instruct', 'mistral-nemo:12b',
      'gemma2:9b', 'gemma2:27b', 'gemma:7b',
      'deepseek-coder:6.7b', 'deepseek-coder:33b',
      'codellama:7b', 'codellama:13b', 'codellama:34b',
      'neural-chat:7b', 'openchat:7b', 'starling-lm:7b'
    ];

    return commonModels
      .filter(model => model.toLowerCase().includes(query.toLowerCase()))
      .slice(0, 5);
  }

  async validateModelName(modelName: string): Promise<{ isValid: boolean; suggestions: string[] }> {
    const cleanName = modelName.trim().toLowerCase();
    
    // Basic format validation - should contain at least one colon for tag
    if (!cleanName.includes(':')) {
      const suggestions = await this.searchAvailableModels(cleanName);
      return {
        isValid: false,
        suggestions
      };
    }

    // Check if it follows valid model naming pattern
    const modelPattern = /^[a-zA-Z0-9][a-zA-Z0-9._-]*:[a-zA-Z0-9][a-zA-Z0-9._-]*$/;
    if (!modelPattern.test(cleanName)) {
      const suggestions = await this.searchAvailableModels(cleanName.split(':')[0]);
      return {
        isValid: false,
        suggestions
      };
    }

    return { isValid: true, suggestions: [] };
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