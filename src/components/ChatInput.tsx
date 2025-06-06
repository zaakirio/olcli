import React from 'react';
import { Box, Text, useInput } from 'ink';

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (value: string) => void;
  placeholder?: string;
  focused?: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  value,
  onChange,
  onSubmit,
  placeholder = '',
  focused = true,
}) => {
  useInput(
    (input: string, key: any) => {
      if (!focused) return;

      if (key.return) {
        onSubmit(value);
      } else if (key.backspace || key.delete) {
        onChange(value.slice(0, -1));
      } else if (key.ctrl && input === 'c') {
        // Let the parent handle Ctrl+C
        return;
      } else if (input && !key.ctrl && !key.meta) {
        onChange(value + input);
      }
    },
    { isActive: focused }
  );

  return (
    <Box>
      <Text color="green" bold>
        &gt;{' '}
      </Text>
      <Text>
        {value || (focused ? '' : placeholder)}
      </Text>
      {focused && (
        <Text color="green">
          ▋
        </Text>
      )}
    </Box>
  );
};