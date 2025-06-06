import React, { useState } from 'react';
import { Box, Text } from 'ink';
import { ModelSelector } from './components/ModelSelector.js';
import { ChatInterface } from './components/ChatInterface.js';
import { ErrorDisplay } from './components/ErrorDisplay.js';
import { ProfileManager } from './components/ProfileManager.js';
import { TemplateManager } from './components/TemplateManager.js';
import { ModelInstaller } from './components/ModelInstaller.js';
import { ChatExportManager } from './components/ChatExportManager.js';
import { MainMenu } from './components/MainMenu.js';
import { ModelStatus, Profile, Template, ChatExport, ChatMessage } from './types.js';

type AppView = 'main-menu' | 'model-selection' | 'chat' | 'profiles' | 'templates' | 'model-install' | 'chat-export';

export const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>('main-menu');
  const [selectedModels, setSelectedModels] = useState<ModelStatus[]>([]);
  const [chatHistory, setChatHistory] = useState<Map<string, ChatMessage[]>>(new Map());
  const [currentProfile, setCurrentProfile] = useState<Profile | undefined>();
  const [currentTemplate, setCurrentTemplate] = useState<Template | undefined>();
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleModelsSelected = (models: ModelStatus[]) => {
    setSelectedModels(models);
    setCurrentView('chat');
    setError(null);
  };

  const handleBackToMenu = () => {
    setCurrentView('main-menu');
    setError(null);
    setSuccessMessage(null);
  };

  const handleBackToSelection = () => {
    setCurrentView('model-selection');
    setSelectedModels([]);
    setChatHistory(new Map());
    setError(null);
  };

  const handleError = (errorMessage: string) => {
    setError(errorMessage);
    setTimeout(() => setError(null), 5000);
  };

  const handleSuccess = (message: string) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(null), 5000);
  };

  const handleDismissError = () => {
    setError(null);
  };

  const handleDismissSuccess = () => {
    setSuccessMessage(null);
  };

  const handleSelectProfile = (profile: Profile | null) => {
    setCurrentProfile(profile || undefined);
    setCurrentView('main-menu');
  };

  const handleSelectTemplate = (template: Template | null) => {
    setCurrentTemplate(template || undefined);
    setCurrentView('main-menu');
  };

  const handleLoadTemplate = (models: ModelStatus[]) => {
    setSelectedModels(models);
    setCurrentView('chat');
  };

  const handleImportChat = (chatData: ChatExport) => {
    // Convert plain object back to Map
    const newChatHistory = new Map<string, ChatMessage[]>();
    Object.entries(chatData.messages).forEach(([modelName, messages]) => {
      newChatHistory.set(modelName, messages);
    });
    
    setChatHistory(newChatHistory);
    setCurrentProfile(chatData.profile);
    setCurrentTemplate(chatData.template);
    
    // Set up models from the chat data
    const models: ModelStatus[] = chatData.models.map(modelName => ({
      name: modelName,
      status: 'idle' as const,
      isSelected: true,
    }));
    setSelectedModels(models);
    setCurrentView('chat');
  };

  return (
    <Box flexDirection="column" height="100%">
      {error && (
        <ErrorDisplay error={error} onDismiss={handleDismissError} />
      )}
      
      {successMessage && (
        <Box padding={1} borderStyle="single" borderColor="green">
          <Text color="green">✅ {successMessage} (Auto-dismissing...)</Text>
        </Box>
      )}
      
      {currentView === 'main-menu' && (
        <MainMenu
          currentProfile={currentProfile}
          currentTemplate={currentTemplate}
          onSelectView={(view: string) => setCurrentView(view as AppView)}
          onError={handleError}
        />
      )}

      {currentView === 'model-selection' && (
        <ModelSelector
          onModelsSelected={handleModelsSelected}
          onBack={handleBackToMenu}
          onError={handleError}
        />
      )}

      {currentView === 'profiles' && (
        <ProfileManager
          onSelectProfile={handleSelectProfile}
          onBack={handleBackToMenu}
          onError={handleError}
        />
      )}

      {currentView === 'templates' && (
        <TemplateManager
          onSelectTemplate={handleSelectTemplate}
          onLoadTemplate={handleLoadTemplate}
          onBack={handleBackToMenu}
          onError={handleError}
        />
      )}

      {currentView === 'model-install' && (
        <ModelInstaller
          onBack={handleBackToMenu}
          onError={handleError}
          onSuccess={handleSuccess}
        />
      )}

      {currentView === 'chat-export' && (
        <ChatExportManager
          chatHistory={chatHistory}
          selectedModels={selectedModels.map(m => m.name)}
          currentProfile={currentProfile}
          currentTemplate={currentTemplate}
          onImportChat={handleImportChat}
          onBack={handleBackToMenu}
          onError={handleError}
          onSuccess={handleSuccess}
        />
      )}

      {currentView === 'chat' && (
        <ChatInterface
          selectedModels={selectedModels}
          currentProfile={currentProfile}
          chatHistory={chatHistory}
          onChatHistoryChange={setChatHistory}
          onBack={handleBackToSelection}
          onError={handleError}
        />
      )}
    </Box>
  );
};