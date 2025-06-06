import React, { useState, useEffect } from 'react';
import { Box, Text, useInput, Spacer } from 'ink';
import { OllamaModel, ModelStatus } from '../types.js';
import { OllamaService } from '../services/ollama.js';

interface ModelSelectorProps {
  onModelsSelected: (models: ModelStatus[]) => void;
  onBack: () => void;
  onError: (error: string) => void;
}

export const ModelSelector: React.FC<ModelSelectorProps> = ({ onModelsSelected, onBack, onError }) => {
  const [models, setModels] = useState<OllamaModel[]>([]);
  const [selectedIndexes, setSelectedIndexes] = useState<Set<number>>(new Set());
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const ollamaService = new OllamaService();

  useEffect(() => {
    const loadModels = async () => {
      try {
        setIsLoading(true);
        const response = await ollamaService.getAvailableModels();
        setModels(response.models);
        setIsLoading(false);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to load models';
        onError(errorMessage);
        setIsLoading(false);
      }
    };

    loadModels();
  }, []);

  useInput((input: string, key: any) => {
    if (isLoading || models.length === 0) return;

    if (key.escape) {
      onBack();
    } else if (key.upArrow) {
      setCurrentIndex(prev => Math.max(0, prev - 1));
    } else if (key.downArrow) {
      setCurrentIndex(prev => Math.min(models.length - 1, prev + 1));
    } else if (input === ' ') {
      setSelectedIndexes(prev => {
        const newSet = new Set(prev);
        if (newSet.has(currentIndex)) {
          newSet.delete(currentIndex);
        } else {
          newSet.add(currentIndex);
        }
        return newSet;
      });
    } else if (key.return) {
      if (selectedIndexes.size === 0) {
        onError('Please select at least one model');
        return;
      }

      const selectedModels: ModelStatus[] = Array.from(selectedIndexes).map(index => ({
        name: models[index].name,
        status: 'idle' as const,
        isSelected: true,
      }));

      onModelsSelected(selectedModels);
    }
  });

  if (isLoading) {
    return (
      <Box flexDirection="column" padding={1}>
        <Text color="blue">Loading available models...</Text>
      </Box>
    );
  }

  if (models.length === 0) {
    return (
      <Box flexDirection="column" padding={1}>
        <Text color="red">No models found. Make sure Ollama is running and has models installed.</Text>
        <Text color="gray">Run 'ollama list' to see available models.</Text>
      </Box>
    );
  }

  return (
    <Box flexDirection="column" padding={1}>
      <Box marginBottom={1}>
        <Text color="green" bold>
          Select Models for Multi-Chat
        </Text>
      </Box>
      
      <Box marginBottom={1}>
        <Text color="gray">
          Use ↑/↓ to navigate, SPACE to select/deselect, ENTER to continue
        </Text>
      </Box>

      {models.map((model, index) => (
        <Box key={model.name} marginBottom={0}>
          <Text color={index === currentIndex ? 'blue' : 'white'}>
            {index === currentIndex ? '▶ ' : '  '}
            {selectedIndexes.has(index) ? '☑' : '☐'} {model.name}
          </Text>
          <Spacer />
          <Text color="gray" dimColor>
            {(model.size / (1024 * 1024 * 1024)).toFixed(1)}GB
          </Text>
        </Box>
      ))}

      <Box marginTop={1}>
        <Text color="yellow">
          Selected: {selectedIndexes.size} model{selectedIndexes.size !== 1 ? 's' : ''}
        </Text>
      </Box>
    </Box>
  );
};