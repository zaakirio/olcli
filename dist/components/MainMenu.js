import React from 'react';
import { Box, Text } from 'ink';
import SelectInput from 'ink-select-input';
export const MainMenu = ({ currentProfile, currentTemplate, onSelectView, onError, }) => {
    const menuItems = [
        { label: '🚀 Start Chat Session', value: 'model-selection' },
        { label: '👤 Manage Profiles', value: 'profiles' },
        { label: '📋 Manage Templates', value: 'templates' },
        { label: '⬇️ Install Models', value: 'model-install' },
        { label: '💾 Export/Import Chats', value: 'chat-export' },
    ];
    return (React.createElement(Box, { flexDirection: "column", padding: 1 },
        React.createElement(Box, { marginBottom: 2, flexDirection: "column", alignItems: "center" },
            React.createElement(Text, { color: "green", bold: true }, "\uD83E\uDD99 Ollama Multi-Chat CLI"),
            React.createElement(Text, { color: "gray" }, "Chat with multiple AI models simultaneously")),
        React.createElement(Box, { marginBottom: 2, borderStyle: "single", padding: 1 },
            React.createElement(Box, { flexDirection: "column" },
                React.createElement(Text, { color: "cyan", bold: true }, "Current Settings:"),
                React.createElement(Text, null,
                    "Profile: ",
                    currentProfile ? (React.createElement(Text, { color: "green" }, currentProfile.name)) : (React.createElement(Text, { color: "gray" }, "None"))),
                React.createElement(Text, null,
                    "Template: ",
                    currentTemplate ? (React.createElement(Text, { color: "green" }, currentTemplate.name)) : (React.createElement(Text, { color: "gray" }, "None"))))),
        React.createElement(Box, { flexDirection: "column" },
            React.createElement(Text, { color: "yellow", bold: true }, "Main Menu:"),
            React.createElement(Box, { marginTop: 1 },
                React.createElement(SelectInput, { items: menuItems, onSelect: (item) => onSelectView(item.value) }))),
        React.createElement(Box, { marginTop: 2, borderStyle: "single", padding: 1 },
            React.createElement(Box, { flexDirection: "column" },
                React.createElement(Text, { color: "cyan", bold: true }, "Getting Started:"),
                React.createElement(Text, { color: "gray" }, "1. Set up a Profile (optional) for context/persona"),
                React.createElement(Text, { color: "gray" }, "2. Choose a Template (optional) for pre-selected models"),
                React.createElement(Text, { color: "gray" }, "3. Start a Chat Session to begin conversations"),
                React.createElement(Text, { color: "gray" }, "4. Install Models to add new AI models"),
                React.createElement(Text, { color: "gray" }, "5. Export/Import to save and load chat sessions")))));
};
//# sourceMappingURL=MainMenu.js.map