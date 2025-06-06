import React, { useEffect, useRef, memo } from 'react';
import { Box, Text, Newline, Static } from 'ink';
import { ModelStatus, ChatMessage } from '../types.js';
import { OllamaService } from '../services/ollama.js';

interface ModelPanelProps {
  model: ModelStatus;
  messages: ChatMessage[];
  streamingContent: string;
  onUpdateStatus: (modelName: string, status: ModelStatus['status'], error?: string) => void;
  onAddMessage: (modelName: string, message: ChatMessage) => void;
  onStreamingUpdate: (modelName: string, content: string) => void;
  onError: (error: string) => void;
}

export const ModelPanel: React.FC<ModelPanelProps> = memo(({
  model,
  messages,
  streamingContent,
  onUpdateStatus,
  onAddMessage,
  onStreamingUpdate,
  onError,
}) => {
  const ollamaService = useRef(new OllamaService());
  const isStreamingRef = useRef(false);

  useEffect(() => {
    const handleUserMessage = async () => {
      if (model.status !== 'responding' || isStreamingRef.current) return;
      
      const userMessages = messages.filter(m => m.role === 'user');
      const lastUserMessage = userMessages[userMessages.length - 1];
      
      if (!lastUserMessage) return;

      // Check if we already have a response for this user message
      const messagesAfterUser = messages.slice(messages.lastIndexOf(lastUserMessage) + 1);
      if (messagesAfterUser.some(m => m.role === 'assistant')) return;

      isStreamingRef.current = true;
      const startTime = Date.now();

      try {
        onUpdateStatus(model.name, 'responding');
        
        let assistantMessage = '';
        const chatRequest = {
          model: model.name,
          messages: messages.map(m => ({ role: m.role, content: m.content })),
        };

        console.log(`Starting chat for model: ${model.name}`);
        const stream = ollamaService.current.chatStream(chatRequest);
        
        // Set a timeout based on model size (larger models need more time)
        const getTimeoutForModel = (modelName: string) => {
          if (modelName.includes('24b') || modelName.includes('70b')) {
            return 300000; // 5 minutes for very large models
          } else if (modelName.includes('7b') || modelName.includes('8b') || modelName.includes('13b')) {
            return 180000; // 3 minutes for medium models
          }
          return 120000; // 2 minutes for smaller models
        };
        
        const timeoutMs = getTimeoutForModel(model.name);
        const timeoutId = setTimeout(() => {
          throw new Error(`Timeout: ${model.name} took too long to respond (>${timeoutMs/1000}s)`);
        }, timeoutMs);
        
        let lastUpdateTime = Date.now();
        const updateThreshold = 150; // Only update every 150ms to reduce flicker
        let pendingUpdate: string | null = null;
        let updateTimer: NodeJS.Timeout | null = null;
        
        for await (const chunk of stream) {
          if (chunk.message?.content) {
            assistantMessage += chunk.message.content;
            
            // Filter out thinking content for cleaner display
            let displayContent = assistantMessage
              .replace(/<think>[\s\S]*?<\/think>/g, '')
              .trim();
            
            // Throttle and debounce updates to reduce flickering
            const now = Date.now();
            if (displayContent) {
              pendingUpdate = displayContent;
              
              if (now - lastUpdateTime > updateThreshold || chunk.done) {
                if (updateTimer) clearTimeout(updateTimer);
                onStreamingUpdate(model.name, displayContent);
                lastUpdateTime = now;
                pendingUpdate = null;
              } else if (!updateTimer) {
                // Schedule an update if we haven't updated recently
                updateTimer = setTimeout(() => {
                  if (pendingUpdate) {
                    onStreamingUpdate(model.name, pendingUpdate);
                    lastUpdateTime = Date.now();
                    pendingUpdate = null;
                  }
                  updateTimer = null;
                }, updateThreshold);
              }
            }
          }
          
          if (chunk.done) {
            clearTimeout(timeoutId);
            if (updateTimer) clearTimeout(updateTimer);
            const responseTime = Date.now() - startTime;
            
            // Add final message to chat history
            let finalContent = assistantMessage
              .replace(/<think>[\s\S]*?<\/think>/g, '')
              .trim();
            
            if (finalContent) {
              const finalMessage: ChatMessage = {
                role: 'assistant',
                content: finalContent,
                timestamp: Date.now(),
              };
              onAddMessage(model.name, finalMessage);
            } else {
              // If no content, add a fallback message
              const fallbackMessage: ChatMessage = {
                role: 'assistant',
                content: 'No response generated.',
                timestamp: Date.now(),
              };
              onAddMessage(model.name, fallbackMessage);
            }
            
            console.log(`Model ${model.name} completed in ${responseTime}ms`);
            onUpdateStatus(model.name, 'ready');
            break;
          }
        }
        
        clearTimeout(timeoutId);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        onUpdateStatus(model.name, 'error', errorMessage);
        onError(`${model.name}: ${errorMessage}`);
      } finally {
        isStreamingRef.current = false;
      }
    };

    handleUserMessage();
  }, [model.status, messages, model.name, onUpdateStatus, onAddMessage, onStreamingUpdate, onError]);

  const getStatusIcon = () => {
    switch (model.status) {
      case 'loading': return '⏳';
      case 'ready': return '✅';
      case 'responding': return '💭';
      case 'error': return '❌';
      case 'idle': return '⚪';
      default: return '⚪';
    }
  };

  const getStatusColor = () => {
    switch (model.status) {
      case 'ready': return 'green';
      case 'responding': return 'blue';
      case 'error': return 'red';
      case 'loading': return 'yellow';
      default: return 'gray';
    }
  };

  const Message = memo(({ message, index }: { message: ChatMessage; index: number }) => {
    const isUser = message.role === 'user';
    return (
      <Box key={index} marginBottom={1} flexDirection="column">
        <Text color={isUser ? 'cyan' : 'white'} bold>
          {isUser ? 'You' : model.name}:
        </Text>
        <Text wrap="wrap">
          {message.content}
        </Text>
      </Box>
    );
  });

  return (
    <Box flexDirection="column" height="100%" paddingX={1}>
      {/* Model Header */}
      <Box paddingY={0} marginBottom={1}>
        <Text color={getStatusColor()} bold>
          {getStatusIcon()} {model.name}
        </Text>
        {model.status === 'error' && model.error && (
          <Box marginTop={0}>
            <Text color="red" dimColor wrap="wrap">
              Error: {model.error}
            </Text>
            {model.error.includes('Timeout') && (
              <Text color="yellow" dimColor wrap="wrap">
                Large models may need more time to load. Try again or select a smaller model.
              </Text>
            )}
          </Box>
        )}
      </Box>

      {/* Messages */}
      <Box flexDirection="column" flexGrow={1} overflowY="hidden">
        {messages.length === 0 && !streamingContent ? (
          <Text color="gray" dimColor>
            Waiting for your first message...
          </Text>
        ) : (
          <>
            <Static items={messages}>
              {(message, index) => <Message key={index} message={message} index={index} />}
            </Static>
            
            {/* Show streaming content when responding */}
            {model.status === 'responding' && streamingContent && (
              <Box marginBottom={1} flexDirection="column">
                <Text color="white" bold>
                  {model.name}:
                </Text>
                <Text wrap="wrap">
                  {streamingContent}
                </Text>
              </Box>
            )}
            
            {model.status === 'responding' && !streamingContent && (
              <Box>
                <Text color="blue">
                  {model.name.includes('24b') || model.name.includes('70b') 
                    ? `${model.name} is loading (large model, may take 2-5 minutes)...`
                    : `${model.name} is thinking...`}
                </Text>
              </Box>
            )}
          </>
        )}
      </Box>
    </Box>
  );
});