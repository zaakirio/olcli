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
export const App = () => {
    const [currentView, setCurrentView] = useState('main-menu');
    const [selectedModels, setSelectedModels] = useState([]);
    const [chatHistory, setChatHistory] = useState(new Map());
    const [currentProfile, setCurrentProfile] = useState();
    const [currentTemplate, setCurrentTemplate] = useState();
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);
    const handleModelsSelected = (models) => {
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
    const handleError = (errorMessage) => {
        setError(errorMessage);
        setTimeout(() => setError(null), 5000);
    };
    const handleSuccess = (message) => {
        setSuccessMessage(message);
        setTimeout(() => setSuccessMessage(null), 5000);
    };
    const handleDismissError = () => {
        setError(null);
    };
    const handleDismissSuccess = () => {
        setSuccessMessage(null);
    };
    const handleSelectProfile = (profile) => {
        setCurrentProfile(profile || undefined);
        setCurrentView('main-menu');
    };
    const handleSelectTemplate = (template) => {
        setCurrentTemplate(template || undefined);
        setCurrentView('main-menu');
    };
    const handleLoadTemplate = (models) => {
        setSelectedModels(models);
        setCurrentView('chat');
    };
    const handleImportChat = (chatData) => {
        // Convert plain object back to Map
        const newChatHistory = new Map();
        Object.entries(chatData.messages).forEach(([modelName, messages]) => {
            newChatHistory.set(modelName, messages);
        });
        setChatHistory(newChatHistory);
        setCurrentProfile(chatData.profile);
        setCurrentTemplate(chatData.template);
        // Set up models from the chat data
        const models = chatData.models.map(modelName => ({
            name: modelName,
            status: 'idle',
            isSelected: true,
        }));
        setSelectedModels(models);
        setCurrentView('chat');
    };
    return (React.createElement(Box, { flexDirection: "column", height: "100%" },
        error && (React.createElement(ErrorDisplay, { error: error, onDismiss: handleDismissError })),
        successMessage && (React.createElement(Box, { padding: 1, borderStyle: "single", borderColor: "green" },
            React.createElement(Text, { color: "green" },
                "\u2705 ",
                successMessage,
                " (Auto-dismissing...)"))),
        currentView === 'main-menu' && (React.createElement(MainMenu, { currentProfile: currentProfile, currentTemplate: currentTemplate, onSelectView: (view) => setCurrentView(view), onError: handleError })),
        currentView === 'model-selection' && (React.createElement(ModelSelector, { onModelsSelected: handleModelsSelected, onBack: handleBackToMenu, onError: handleError })),
        currentView === 'profiles' && (React.createElement(ProfileManager, { onSelectProfile: handleSelectProfile, onBack: handleBackToMenu, onError: handleError })),
        currentView === 'templates' && (React.createElement(TemplateManager, { onSelectTemplate: handleSelectTemplate, onLoadTemplate: handleLoadTemplate, onBack: handleBackToMenu, onError: handleError })),
        currentView === 'model-install' && (React.createElement(ModelInstaller, { onBack: handleBackToMenu, onError: handleError, onSuccess: handleSuccess })),
        currentView === 'chat-export' && (React.createElement(ChatExportManager, { chatHistory: chatHistory, selectedModels: selectedModels.map(m => m.name), currentProfile: currentProfile, currentTemplate: currentTemplate, onImportChat: handleImportChat, onBack: handleBackToMenu, onError: handleError, onSuccess: handleSuccess })),
        currentView === 'chat' && (React.createElement(ChatInterface, { selectedModels: selectedModels, currentProfile: currentProfile, chatHistory: chatHistory, onChatHistoryChange: setChatHistory, onBack: handleBackToSelection, onError: handleError }))));
};
//# sourceMappingURL=App.js.map