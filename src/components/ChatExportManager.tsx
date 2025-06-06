import React, { useState, useEffect } from 'react';
import { Box, Text, useInput } from 'ink';
import SelectInput from 'ink-select-input';
import TextInput from 'ink-text-input';
import { ChatExport, ChatMessage, Profile, Template } from '../types.js';
import { StorageService } from '../services/storage.js';

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

type ExportView = 'menu' | 'export' | 'import' | 'list';

export const ChatExportManager: React.FC<ChatExportManagerProps> = ({
  chatHistory,
  selectedModels,
  currentProfile,
  currentTemplate,
  onImportChat,
  onBack,
  onError,
  onSuccess,
}) => {
  const [currentView, setCurrentView] = useState<ExportView>('menu');
  const [exportedChats, setExportedChats] = useState<string[]>([]);
  const [exportName, setExportName] = useState('');

  const storageService = new StorageService();

  useEffect(() => {
    loadExportedChats();
  }, []);

  const loadExportedChats = () => {
    try {
      const chats = storageService.getExportedChats();
      setExportedChats(chats);
    } catch (error) {
      onError('Failed to load exported chats');
    }
  };

  useInput((input, key) => {
    if (key.escape) {
      if (currentView === 'menu') {
        onBack();
      } else {
        setCurrentView('menu');
        setExportName('');
      }
    }
  });

  const handleExportChat = async () => {
    if (!exportName.trim()) {
      onError('Please enter a name for the export');
      return;
    }

    try {
      // Convert Map to plain object for serialization
      const messagesObject: Record<string, ChatMessage[]> = {};
      chatHistory.forEach((messages, modelName) => {
        messagesObject[modelName] = messages;
      });

      const chatExport: Omit<ChatExport, 'id'> = {
        name: exportName.trim(),
        timestamp: Date.now(),
        profile: currentProfile,
        template: currentTemplate,
        models: selectedModels,
        messages: messagesObject,
      };

      const filepath = storageService.exportChat(chatExport);
      onSuccess(`Chat exported successfully to: ${filepath}`);
      setExportName('');
      setCurrentView('menu');
      loadExportedChats();
    } catch (error) {
      onError('Failed to export chat');
    }
  };

  const handleImportChat = async (filepath: string) => {
    try {
      const chatData = storageService.importChat(filepath);
      onImportChat(chatData);
      onSuccess(`Chat '${chatData.name}' imported successfully`);
      setCurrentView('menu');
    } catch (error) {
      onError('Failed to import chat');
    }
  };

  if (currentView === 'export') {
    const totalMessages = Array.from(chatHistory.values()).reduce((sum, messages) => sum + messages.length, 0);
    
    return (
      <Box flexDirection="column" padding={1}>
        <Text color="green" bold>Export Current Chat</Text>
        <Text color="gray">ESC: Back to menu</Text>
        <Box marginTop={1} />
        
        <Box flexDirection="column">
          <Text color="cyan">Chat Summary:</Text>
          <Text>Models: {selectedModels.join(', ')}</Text>
          <Text>Total Messages: {totalMessages}</Text>
          {currentProfile && <Text>Profile: {currentProfile.name}</Text>}
          {currentTemplate && <Text>Template: {currentTemplate.name}</Text>}
          <Box marginTop={1} />
          
          <Text>Export Name:</Text>
          <TextInput
            value={exportName}
            onChange={setExportName}
            onSubmit={handleExportChat}
            placeholder="Enter export name..."
          />
          <Box marginTop={1}>
            <Text color="cyan">Press Enter to export</Text>
          </Box>
        </Box>
      </Box>
    );
  }

  if (currentView === 'import') {
    if (exportedChats.length === 0) {
      return (
        <Box flexDirection="column" padding={1}>
          <Text color="green" bold>Import Chat</Text>
          <Text color="gray">ESC: Back to menu</Text>
          <Box marginTop={1} />
          <Text color="yellow">No exported chats found.</Text>
        </Box>
      );
    }

    const chatItems = exportedChats.map(filepath => {
      const filename = filepath.split('/').pop() || filepath;
      return {
        label: filename.replace('.json', ''),
        value: filepath,
      };
    });

    return (
      <Box flexDirection="column" padding={1}>
        <Text color="green" bold>Import Chat</Text>
        <Text color="gray">Select a chat file to import</Text>
        <Text color="gray">ESC: Back to menu</Text>
        <Box marginTop={1} />
        
        <SelectInput
          items={chatItems}
          onSelect={(item) => handleImportChat(item.value)}
        />
      </Box>
    );
  }

  if (currentView === 'list') {
    return (
      <Box flexDirection="column" padding={1}>
        <Text color="green" bold>Exported Chats</Text>
        <Text color="gray">ESC: Back to menu</Text>
        <Box marginTop={1} />
        
        {exportedChats.length === 0 ? (
          <Text color="yellow">No exported chats found.</Text>
        ) : (
          <Box flexDirection="column">
            {exportedChats.map((filepath, index) => {
              const filename = filepath.split('/').pop() || filepath;
              return (
                <Text key={index} color="cyan">
                  {filename.replace('.json', '')}
                </Text>
              );
            })}
            <Box marginTop={1}>
              <Text color="gray">Total: {exportedChats.length} exported chats</Text>
            </Box>
          </Box>
        )}
      </Box>
    );
  }

  // Menu view
  const menuItems = [
    { label: 'Export Current Chat', value: 'export' },
    { label: 'Import Chat', value: 'import' },
    { label: 'List Exported Chats', value: 'list' },
  ];

  return (
    <Box flexDirection="column" padding={1}>
      <Text color="green" bold>Chat Export/Import Manager</Text>
      <Text color="gray">Manage your chat sessions</Text>
      <Text color="gray">ESC: Back to main menu</Text>
      <Box marginTop={1} />
      
      <SelectInput
        items={menuItems}
        onSelect={(item) => setCurrentView(item.value as ExportView)}
      />
      
      <Box marginTop={1}>
        <Text color="cyan">Available Exports: {exportedChats.length}</Text>
      </Box>
    </Box>
  );
};