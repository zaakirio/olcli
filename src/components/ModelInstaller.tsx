import React, { useState, useEffect } from 'react';
import { Box, Text, useInput } from 'ink';
import TextInput from 'ink-text-input';
import { ModelInstallRequest } from '../types.js';
import { OllamaService } from '../services/ollama.js';

interface ModelInstallerProps {
  onBack: () => void;
  onError: (error: string) => void;
  onSuccess: (message: string) => void;
}

export const ModelInstaller: React.FC<ModelInstallerProps> = ({
  onBack,
  onError,
  onSuccess,
}) => {
  const [modelName, setModelName] = useState('');
  const [installRequests, setInstallRequests] = useState<ModelInstallRequest[]>([]);
  const [isInstalling, setIsInstalling] = useState(false);

  const ollamaService = new OllamaService();

  useInput((input, key) => {
    if (key.escape && !isInstalling) {
      onBack();
    }
  });

  const handleInstallModel = async () => {
    if (!modelName.trim()) {
      onError('Please enter a model name');
      return;
    }

    const cleanModelName = modelName.trim();
    
    // Check if already installing this model
    if (installRequests.some(req => req.name === cleanModelName && req.status !== 'completed' && req.status !== 'error')) {
      onError('Model is already being installed');
      return;
    }

    const newRequest: ModelInstallRequest = {
      name: cleanModelName,
      status: 'downloading',
      progress: 0,
    };

    setInstallRequests(prev => [...prev, newRequest]);
    setIsInstalling(true);

    try {
      // Start the installation process
      await ollamaService.pullModel(cleanModelName, (progress) => {
        setInstallRequests(prev => 
          prev.map(req => 
            req.name === cleanModelName 
              ? { ...req, progress, status: progress === 100 ? 'installing' : 'downloading' }
              : req
          )
        );
      });

      // Installation completed
      setInstallRequests(prev => 
        prev.map(req => 
          req.name === cleanModelName 
            ? { ...req, status: 'completed', progress: 100 }
            : req
        )
      );

      onSuccess(`Model '${cleanModelName}' installed successfully!`);
      setModelName('');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      
      setInstallRequests(prev => 
        prev.map(req => 
          req.name === cleanModelName 
            ? { ...req, status: 'error', error: errorMessage }
            : req
        )
      );

      onError(`Failed to install '${cleanModelName}': ${errorMessage}`);
    } finally {
      setIsInstalling(false);
    }
  };

  const getStatusIcon = (status: ModelInstallRequest['status']) => {
    switch (status) {
      case 'downloading': return '⬇️';
      case 'installing': return '⚙️';
      case 'completed': return '✅';
      case 'error': return '❌';
      default: return '⏳';
    }
  };

  const getStatusColor = (status: ModelInstallRequest['status']) => {
    switch (status) {
      case 'downloading': return 'blue';
      case 'installing': return 'yellow';
      case 'completed': return 'green';
      case 'error': return 'red';
      default: return 'gray';
    }
  };

  return (
    <Box flexDirection="column" padding={1}>
      <Text color="green" bold>Install Ollama Model</Text>
      <Text color="gray">Install new models from Ollama registry</Text>
      <Text color="gray">ESC: Back to main menu</Text>
      <Box marginTop={1} />

      <Box flexDirection="column">
        <Text>Model Name (e.g., llama3.2:3b, phi3:mini, qwen2.5:7b):</Text>
        <TextInput
          value={modelName}
          onChange={setModelName}
          onSubmit={handleInstallModel}
          placeholder="Enter model name..."
        />
        <Box marginTop={1}>
          <Text color="cyan">Press Enter to start installation</Text>
        </Box>
      </Box>

      {installRequests.length > 0 && (
        <Box marginTop={2} flexDirection="column">
          <Text color="cyan" bold>Installation Progress:</Text>
          <Box marginTop={1} />
          
          {installRequests.map((request, index) => (
            <Box key={index} flexDirection="column" marginBottom={1}>
              <Box flexDirection="row">
                <Text color={getStatusColor(request.status)}>
                  {getStatusIcon(request.status)} {request.name}
                </Text>
                <Box marginLeft={2}>
                  <Text color="gray">
                    {request.status === 'downloading' || request.status === 'installing' 
                      ? `${request.progress || 0}%` 
                      : request.status}
                  </Text>
                </Box>
              </Box>
              
              {request.status === 'downloading' && (
                <Box marginTop={0}>
                  <Text color="blue">
                    {'█'.repeat(Math.floor((request.progress || 0) / 5))}
                    {'░'.repeat(20 - Math.floor((request.progress || 0) / 5))}
                  </Text>
                </Box>
              )}
              
              {request.error && (
                <Text color="red" wrap="wrap">
                  Error: {request.error}
                </Text>
              )}
            </Box>
          ))}
        </Box>
      )}

      <Box marginTop={2}>
        <Text color="yellow" bold>Popular Models:</Text>
        <Box marginTop={1} flexDirection="column">
          <Text color="gray">• llama3.2:3b - Fast, lightweight general-purpose model</Text>
          <Text color="gray">• phi3:mini - Microsoft's compact model</Text>
          <Text color="gray">• qwen2.5:7b - Alibaba's advanced model</Text>
          <Text color="gray">• deepseek-coder:6.7b - Specialized for coding</Text>
          <Text color="gray">• mistral:7b - Efficient and capable</Text>
          <Text color="gray">• gemma2:9b - Google's Gemma model</Text>
        </Box>
      </Box>

      {isInstalling && (
        <Box marginTop={1}>
          <Text color="yellow">Installation in progress... Please wait.</Text>
        </Box>
      )}
    </Box>
  );
};