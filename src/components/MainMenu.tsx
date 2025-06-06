import React from 'react';
import { Box, Text } from 'ink';
import SelectInput from 'ink-select-input';
import { Profile, Template } from '../types.js';

interface MainMenuProps {
  currentProfile?: Profile;
  currentTemplate?: Template;
  onSelectView: (view: string) => void;
  onError: (error: string) => void;
}

export const MainMenu: React.FC<MainMenuProps> = ({
  currentProfile,
  currentTemplate,
  onSelectView,
  onError,
}) => {
  const menuItems = [
    { label: '🚀 Start Chat Session', value: 'model-selection' },
    { label: '👤 Manage Profiles', value: 'profiles' },
    { label: '📋 Manage Templates', value: 'templates' },
    { label: '⬇️ Install Models', value: 'model-install' },
    { label: '💾 Export/Import Chats', value: 'chat-export' },
  ];

  return (
    <Box flexDirection="column" padding={1}>
      <Box marginBottom={2} flexDirection="column" alignItems="center">
        <Text color="green" bold>
          🦙 Ollama Multi-Chat CLI
        </Text>
        <Text color="gray">
          Chat with multiple AI models simultaneously
        </Text>
      </Box>

      {/* Current Settings */}
      <Box marginBottom={2} borderStyle="single" padding={1}>
        <Box flexDirection="column">
          <Text color="cyan" bold>Current Settings:</Text>
          <Text>
            Profile: {currentProfile ? (
              <Text color="green">{currentProfile.name}</Text>
            ) : (
              <Text color="gray">None</Text>
            )}
          </Text>
          <Text>
            Template: {currentTemplate ? (
              <Text color="green">{currentTemplate.name}</Text>
            ) : (
              <Text color="gray">None</Text>
            )}
          </Text>
        </Box>
      </Box>

      {/* Menu Options */}
      <Box flexDirection="column">
        <Text color="yellow" bold>Main Menu:</Text>
        <Box marginTop={1}>
          <SelectInput
            items={menuItems}
            onSelect={(item) => onSelectView(item.value)}
          />
        </Box>
      </Box>

      {/* Help Text */}
      <Box marginTop={2} borderStyle="single" padding={1}>
        <Box flexDirection="column">
          <Text color="cyan" bold>Getting Started:</Text>
          <Text color="gray">1. Set up a Profile (optional) for context/persona</Text>
          <Text color="gray">2. Choose a Template (optional) for pre-selected models</Text>
          <Text color="gray">3. Start a Chat Session to begin conversations</Text>
          <Text color="gray">4. Install Models to add new AI models</Text>
          <Text color="gray">5. Export/Import to save and load chat sessions</Text>
        </Box>
      </Box>
    </Box>
  );
};