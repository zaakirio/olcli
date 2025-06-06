import React, { useState, useEffect } from 'react';
import { Box, Text, useInput } from 'ink';
import SelectInput from 'ink-select-input';
import TextInput from 'ink-text-input';
import { StorageService } from '../services/storage.js';
export const ChatExportManager = ({ chatHistory, selectedModels, currentProfile, currentTemplate, onImportChat, onBack, onError, onSuccess, }) => {
    const [currentView, setCurrentView] = useState('menu');
    const [exportedChats, setExportedChats] = useState([]);
    const [exportName, setExportName] = useState('');
    const storageService = new StorageService();
    useEffect(() => {
        loadExportedChats();
    }, []);
    const loadExportedChats = () => {
        try {
            const chats = storageService.getExportedChats();
            setExportedChats(chats);
        }
        catch (error) {
            onError('Failed to load exported chats');
        }
    };
    useInput((input, key) => {
        if (key.escape) {
            if (currentView === 'menu') {
                onBack();
            }
            else {
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
            const messagesObject = {};
            chatHistory.forEach((messages, modelName) => {
                messagesObject[modelName] = messages;
            });
            const chatExport = {
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
        }
        catch (error) {
            onError('Failed to export chat');
        }
    };
    const handleImportChat = async (filepath) => {
        try {
            const chatData = storageService.importChat(filepath);
            onImportChat(chatData);
            onSuccess(`Chat '${chatData.name}' imported successfully`);
            setCurrentView('menu');
        }
        catch (error) {
            onError('Failed to import chat');
        }
    };
    if (currentView === 'export') {
        const totalMessages = Array.from(chatHistory.values()).reduce((sum, messages) => sum + messages.length, 0);
        return (React.createElement(Box, { flexDirection: "column", padding: 1 },
            React.createElement(Text, { color: "green", bold: true }, "Export Current Chat"),
            React.createElement(Text, { color: "gray" }, "ESC: Back to menu"),
            React.createElement(Box, { marginTop: 1 }),
            React.createElement(Box, { flexDirection: "column" },
                React.createElement(Text, { color: "cyan" }, "Chat Summary:"),
                React.createElement(Text, null,
                    "Models: ",
                    selectedModels.join(', ')),
                React.createElement(Text, null,
                    "Total Messages: ",
                    totalMessages),
                currentProfile && React.createElement(Text, null,
                    "Profile: ",
                    currentProfile.name),
                currentTemplate && React.createElement(Text, null,
                    "Template: ",
                    currentTemplate.name),
                React.createElement(Box, { marginTop: 1 }),
                React.createElement(Text, null, "Export Name:"),
                React.createElement(TextInput, { value: exportName, onChange: setExportName, onSubmit: handleExportChat, placeholder: "Enter export name..." }),
                React.createElement(Box, { marginTop: 1 },
                    React.createElement(Text, { color: "cyan" }, "Press Enter to export")))));
    }
    if (currentView === 'import') {
        if (exportedChats.length === 0) {
            return (React.createElement(Box, { flexDirection: "column", padding: 1 },
                React.createElement(Text, { color: "green", bold: true }, "Import Chat"),
                React.createElement(Text, { color: "gray" }, "ESC: Back to menu"),
                React.createElement(Box, { marginTop: 1 }),
                React.createElement(Text, { color: "yellow" }, "No exported chats found.")));
        }
        const chatItems = exportedChats.map(filepath => {
            const filename = filepath.split('/').pop() || filepath;
            return {
                label: filename.replace('.json', ''),
                value: filepath,
            };
        });
        return (React.createElement(Box, { flexDirection: "column", padding: 1 },
            React.createElement(Text, { color: "green", bold: true }, "Import Chat"),
            React.createElement(Text, { color: "gray" }, "Select a chat file to import"),
            React.createElement(Text, { color: "gray" }, "ESC: Back to menu"),
            React.createElement(Box, { marginTop: 1 }),
            React.createElement(SelectInput, { items: chatItems, onSelect: (item) => handleImportChat(item.value) })));
    }
    if (currentView === 'list') {
        return (React.createElement(Box, { flexDirection: "column", padding: 1 },
            React.createElement(Text, { color: "green", bold: true }, "Exported Chats"),
            React.createElement(Text, { color: "gray" }, "ESC: Back to menu"),
            React.createElement(Box, { marginTop: 1 }),
            exportedChats.length === 0 ? (React.createElement(Text, { color: "yellow" }, "No exported chats found.")) : (React.createElement(Box, { flexDirection: "column" },
                exportedChats.map((filepath, index) => {
                    const filename = filepath.split('/').pop() || filepath;
                    return (React.createElement(Text, { key: index, color: "cyan" }, filename.replace('.json', '')));
                }),
                React.createElement(Box, { marginTop: 1 },
                    React.createElement(Text, { color: "gray" },
                        "Total: ",
                        exportedChats.length,
                        " exported chats"))))));
    }
    // Menu view
    const menuItems = [
        { label: 'Export Current Chat', value: 'export' },
        { label: 'Import Chat', value: 'import' },
        { label: 'List Exported Chats', value: 'list' },
    ];
    return (React.createElement(Box, { flexDirection: "column", padding: 1 },
        React.createElement(Text, { color: "green", bold: true }, "Chat Export/Import Manager"),
        React.createElement(Text, { color: "gray" }, "Manage your chat sessions"),
        React.createElement(Text, { color: "gray" }, "ESC: Back to main menu"),
        React.createElement(Box, { marginTop: 1 }),
        React.createElement(SelectInput, { items: menuItems, onSelect: (item) => setCurrentView(item.value) }),
        React.createElement(Box, { marginTop: 1 },
            React.createElement(Text, { color: "cyan" },
                "Available Exports: ",
                exportedChats.length))));
};
//# sourceMappingURL=ChatExportManager.js.map