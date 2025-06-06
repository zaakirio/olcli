import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Box, Text, useInput, measureElement } from 'ink';
import { ModelStatus, ChatMessage, Profile } from '../types.js';
import { ModelPanel } from './ModelPanel.js';
import { ChatInput } from './ChatInput.js';

interface ChatInterfaceProps {
  selectedModels: ModelStatus[];
  currentProfile?: Profile;
  chatHistory: Map<string, ChatMessage[]>;
  onChatHistoryChange: (history: Map<string, ChatMessage[]>) => void;
  onBack: () => void;
  onError: (error: string) => void;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ 
  selectedModels,
  currentProfile,
  chatHistory,
  onChatHistoryChange,
  onBack, 
  onError 
}) => {
  const [models, setModels] = useState<ModelStatus[]>(selectedModels);
  const [streamingContent, setStreamingContent] = useState<Map<string, string>>(new Map());
  const [currentInput, setCurrentInput] = useState('');
  const [isInputFocused, setIsInputFocused] = useState(true);

  useInput((input: string, key: any) => {
    if (key.escape) {
      onBack();
    }
  });

  const handleSendMessage = useCallback(async (message: string) => {
    if (!message.trim()) return;

    const userMessage: ChatMessage = {
      role: 'user',
      content: message.trim(),
      timestamp: Date.now(),
    };

    // Add user message to all model histories
    const newHistory = new Map(chatHistory);
    models.forEach(model => {
      const modelHistory = newHistory.get(model.name) || [];
      
      // If this is the first message and we have a profile, add system message
      if (modelHistory.length === 0 && currentProfile) {
        const systemMessage: ChatMessage = {
          role: 'system',
          content: currentProfile.systemPrompt,
          timestamp: Date.now() - 1,
        };
        newHistory.set(model.name, [systemMessage, userMessage]);
      } else {
        newHistory.set(model.name, [...modelHistory, userMessage]);
      }
    });
    
    onChatHistoryChange(newHistory);

    // Update model statuses to 'responding'
    setModels(prev => prev.map(model => ({ 
      ...model, 
      status: 'responding' as const 
    })));

    setCurrentInput('');
  }, [models, chatHistory, currentProfile, onChatHistoryChange]);

  const handleUpdateModelStatus = useCallback((modelName: string, status: ModelStatus['status'], error?: string) => {
    setModels(prev => prev.map(model => 
      model.name === modelName 
        ? { ...model, status, error }
        : model
    ));
  }, []);

  const handleAddMessage = useCallback((modelName: string, message: ChatMessage) => {
    const newHistory = new Map(chatHistory);
    const modelHistory = newHistory.get(modelName) || [];
    newHistory.set(modelName, [...modelHistory, message]);
    onChatHistoryChange(newHistory);
    
    // Clear streaming content when final message is added
    setStreamingContent(prev => {
      const newStreaming = new Map(prev);
      newStreaming.delete(modelName);
      return newStreaming;
    });
  }, [chatHistory, onChatHistoryChange]);

  const handleStreamingUpdate = useCallback((modelName: string, content: string) => {
    setStreamingContent(prev => {
      const newStreaming = new Map(prev);
      newStreaming.set(modelName, content);
      return newStreaming;
    });
  }, []);

  const getPanelWidth = () => {
    const numModels = models.length;
    if (numModels === 1) return '100%';
    if (numModels === 2) return '50%';
    if (numModels <= 3) return '33%';
    return '25%';
  };

  // Memoize the header to prevent unnecessary re-renders
  const header = useMemo(() => (
    <Box paddingX={1} paddingY={0} borderStyle="single" borderBottom>
      <Text color="green" bold>
        Ollama Multi-Chat
      </Text>
      <Text color="gray"> - {models.map(m => m.name).join(', ')}</Text>
      <Box flexGrow={1} />
      <Text color="gray" dimColor>
        ESC: Back to model selection
      </Text>
    </Box>
  ), [models]);

  return (
    <Box flexDirection="column" height="100%">
      {/* Header */}
      {header}

      {/* Chat Panels */}
      <Box flexGrow={1} flexDirection="row">
        {models.map((model, index) => (
          <Box key={model.name} width={getPanelWidth()} borderStyle="single" borderRight={index < models.length - 1}>
            <ModelPanel
              model={model}
              messages={chatHistory.get(model.name) || []}
              streamingContent={streamingContent.get(model.name) || ''}
              onUpdateStatus={handleUpdateModelStatus}
              onAddMessage={handleAddMessage}
              onStreamingUpdate={handleStreamingUpdate}
              onError={onError}
            />
          </Box>
        ))}
      </Box>

      {/* Input Section */}
      <Box borderStyle="single" borderTop paddingX={1} paddingY={0}>
        <ChatInput
          value={currentInput}
          onChange={setCurrentInput}
          onSubmit={handleSendMessage}
          placeholder="Enter your message..."
          focused={isInputFocused}
        />
      </Box>
    </Box>
  );
};