import React, { useState, useCallback, useMemo } from 'react';
import { Box, Text, useInput } from 'ink';
import { ModelPanel } from './ModelPanel.js';
import { ChatInput } from './ChatInput.js';
export const ChatInterface = ({ selectedModels, currentProfile, chatHistory, onChatHistoryChange, onBack, onError }) => {
    const [models, setModels] = useState(selectedModels);
    const [streamingContent, setStreamingContent] = useState(new Map());
    const [currentInput, setCurrentInput] = useState('');
    const [isInputFocused, setIsInputFocused] = useState(true);
    useInput((input, key) => {
        if (key.escape) {
            onBack();
        }
    });
    const handleSendMessage = useCallback(async (message) => {
        if (!message.trim())
            return;
        const userMessage = {
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
                const systemMessage = {
                    role: 'system',
                    content: currentProfile.systemPrompt,
                    timestamp: Date.now() - 1,
                };
                newHistory.set(model.name, [systemMessage, userMessage]);
            }
            else {
                newHistory.set(model.name, [...modelHistory, userMessage]);
            }
        });
        onChatHistoryChange(newHistory);
        // Update model statuses to 'responding'
        setModels(prev => prev.map(model => ({
            ...model,
            status: 'responding'
        })));
        setCurrentInput('');
    }, [models, chatHistory, currentProfile, onChatHistoryChange]);
    const handleUpdateModelStatus = useCallback((modelName, status, error) => {
        setModels(prev => prev.map(model => model.name === modelName
            ? { ...model, status, error }
            : model));
    }, []);
    const handleAddMessage = useCallback((modelName, message) => {
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
    const handleStreamingUpdate = useCallback((modelName, content) => {
        setStreamingContent(prev => {
            const newStreaming = new Map(prev);
            newStreaming.set(modelName, content);
            return newStreaming;
        });
    }, []);
    const getPanelWidth = () => {
        const numModels = models.length;
        if (numModels === 1)
            return '100%';
        if (numModels === 2)
            return '50%';
        if (numModels <= 3)
            return '33%';
        return '25%';
    };
    // Memoize the header to prevent unnecessary re-renders
    const header = useMemo(() => (React.createElement(Box, { paddingX: 1, paddingY: 0, borderStyle: "single", borderBottom: true },
        React.createElement(Text, { color: "green", bold: true }, "Ollama Multi-Chat"),
        React.createElement(Text, { color: "gray" },
            " - ",
            models.map(m => m.name).join(', ')),
        React.createElement(Box, { flexGrow: 1 }),
        React.createElement(Text, { color: "gray", dimColor: true }, "ESC: Back to model selection"))), [models]);
    return (React.createElement(Box, { flexDirection: "column", height: "100%" },
        header,
        React.createElement(Box, { flexGrow: 1, flexDirection: "row" }, models.map((model, index) => (React.createElement(Box, { key: model.name, width: getPanelWidth(), borderStyle: "single", borderRight: index < models.length - 1 },
            React.createElement(ModelPanel, { model: model, messages: chatHistory.get(model.name) || [], streamingContent: streamingContent.get(model.name) || '', onUpdateStatus: handleUpdateModelStatus, onAddMessage: handleAddMessage, onStreamingUpdate: handleStreamingUpdate, onError: onError }))))),
        React.createElement(Box, { borderStyle: "single", borderTop: true, paddingX: 1, paddingY: 0 },
            React.createElement(ChatInput, { value: currentInput, onChange: setCurrentInput, onSubmit: handleSendMessage, placeholder: "Enter your message...", focused: isInputFocused }))));
};
//# sourceMappingURL=ChatInterface.js.map