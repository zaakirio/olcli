import React from 'react';
import { Box, Text } from 'ink';

interface ErrorDisplayProps {
  error: string;
  onDismiss?: () => void;
}

export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ error, onDismiss }) => {
  return (
    <Box
      borderStyle="single"
      borderColor="red"
      padding={1}
      marginBottom={1}
      flexDirection="column"
    >
      <Box marginBottom={1}>
        <Text color="red" bold>
          ❌ Error
        </Text>
      </Box>
      <Text wrap="wrap" color="red">
        {error}
      </Text>
      {onDismiss && (
        <Box marginTop={1}>
          <Text color="gray" dimColor>
            Press any key to dismiss
          </Text>
        </Box>
      )}
    </Box>
  );
};