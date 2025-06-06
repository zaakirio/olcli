import { OllamaService } from '../services/ollama';
// Mock fetch globally
global.fetch = jest.fn();
describe('OllamaService', () => {
    let service;
    const mockFetch = fetch;
    beforeEach(() => {
        service = new OllamaService();
        mockFetch.mockClear();
    });
    describe('getAvailableModels', () => {
        it('should fetch and return available models', async () => {
            const mockResponse = {
                models: [
                    {
                        name: 'llama2',
                        size: 3825819519,
                        digest: 'abc123',
                        modified_at: '2023-01-01T00:00:00Z',
                    },
                ],
            };
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => mockResponse,
            });
            const result = await service.getAvailableModels();
            expect(mockFetch).toHaveBeenCalledWith('http://localhost:11434/api/tags');
            expect(result).toEqual(mockResponse);
        });
        it('should throw error when request fails', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: false,
                status: 404,
                statusText: 'Not Found',
            });
            await expect(service.getAvailableModels()).rejects.toThrow('Failed to fetch models: 404 Not Found');
        });
        it('should handle network errors', async () => {
            mockFetch.mockRejectedValueOnce(new Error('Network error'));
            await expect(service.getAvailableModels()).rejects.toThrow('Failed to connect to Ollama: Network error');
        });
    });
    describe('checkConnection', () => {
        it('should return true when connection is successful', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: true,
            });
            const result = await service.checkConnection();
            expect(result).toBe(true);
            expect(mockFetch).toHaveBeenCalledWith('http://localhost:11434/api/tags');
        });
        it('should return false when connection fails', async () => {
            mockFetch.mockRejectedValueOnce(new Error('Connection failed'));
            const result = await service.checkConnection();
            expect(result).toBe(false);
        });
    });
});
//# sourceMappingURL=ollama.test.js.map