import React, { useState } from 'react';
import { Box, Text, useInput } from 'ink';
import TextInput from 'ink-text-input';
import { OllamaService } from '../services/ollama.js';
export const ModelInstaller = ({ onBack, onError, onSuccess, }) => {
    const [modelName, setModelName] = useState('');
    const [installRequests, setInstallRequests] = useState([]);
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
        // Validate model name first
        try {
            const validation = await ollamaService.validateModelName(cleanModelName);
            if (!validation.isValid) {
                let errorMsg = `'${cleanModelName}' doesn't appear to be a valid model name.`;
                if (validation.suggestions.length > 0) {
                    errorMsg += `\n\nDid you mean one of these?\n${validation.suggestions.map(s => `• ${s}`).join('\n')}`;
                }
                else {
                    errorMsg += '\n\nModel names should include a tag (e.g., "llama3.2:3b", "phi3:mini").';
                }
                onError(errorMsg);
                return;
            }
        }
        catch (validationError) {
            // If validation fails (e.g., network error), proceed with installation
            // The actual pull will catch any real errors
            console.warn('Model validation failed, proceeding with installation:', validationError);
        }
        const newRequest = {
            name: cleanModelName,
            status: 'downloading',
            progress: 0,
        };
        setInstallRequests(prev => [...prev, newRequest]);
        setIsInstalling(true);
        try {
            // Start the installation process
            await ollamaService.pullModel(cleanModelName, (progress) => {
                setInstallRequests(prev => prev.map(req => req.name === cleanModelName
                    ? { ...req, progress, status: progress === 100 ? 'installing' : 'downloading' }
                    : req));
            });
            // Installation completed
            setInstallRequests(prev => prev.map(req => req.name === cleanModelName
                ? { ...req, status: 'completed', progress: 100 }
                : req));
            onSuccess(`Model '${cleanModelName}' installed successfully!`);
            setModelName('');
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            setInstallRequests(prev => prev.map(req => req.name === cleanModelName
                ? { ...req, status: 'error', error: errorMessage }
                : req));
            // Check if it's a "model not found" type error and provide suggestions
            if (errorMessage.toLowerCase().includes('not found') || errorMessage.toLowerCase().includes('unknown model')) {
                try {
                    const suggestions = await ollamaService.searchAvailableModels(cleanModelName.split(':')[0]);
                    let enhancedError = `Model '${cleanModelName}' not found.`;
                    if (suggestions.length > 0) {
                        enhancedError += `\n\nSimilar models available:\n${suggestions.map(s => `• ${s}`).join('\n')}`;
                    }
                    onError(enhancedError);
                }
                catch {
                    onError(`Model '${cleanModelName}' not found. Please check the model name and try again.`);
                }
            }
            else {
                onError(`Failed to install '${cleanModelName}': ${errorMessage}`);
            }
        }
        finally {
            setIsInstalling(false);
        }
    };
    const getStatusIcon = (status) => {
        switch (status) {
            case 'downloading': return '⬇️';
            case 'installing': return '⚙️';
            case 'completed': return '✅';
            case 'error': return '❌';
            default: return '⏳';
        }
    };
    const getStatusColor = (status) => {
        switch (status) {
            case 'downloading': return 'blue';
            case 'installing': return 'yellow';
            case 'completed': return 'green';
            case 'error': return 'red';
            default: return 'gray';
        }
    };
    return (React.createElement(Box, { flexDirection: "column", padding: 1 },
        React.createElement(Text, { color: "green", bold: true }, "Install Ollama Model"),
        React.createElement(Text, { color: "gray" }, "Install new models from Ollama registry"),
        React.createElement(Text, { color: "gray" }, "ESC: Back to main menu"),
        React.createElement(Box, { marginTop: 1 }),
        React.createElement(Box, { flexDirection: "column" },
            React.createElement(Text, null, "Model Name (e.g., llama3.2:3b, phi3:mini, qwen2.5:7b):"),
            React.createElement(TextInput, { value: modelName, onChange: setModelName, onSubmit: handleInstallModel, placeholder: "Enter model name..." }),
            React.createElement(Box, { marginTop: 1 },
                React.createElement(Text, { color: "cyan" }, "Press Enter to start installation"))),
        installRequests.length > 0 && (React.createElement(Box, { marginTop: 2, flexDirection: "column" },
            React.createElement(Text, { color: "cyan", bold: true }, "Installation Progress:"),
            React.createElement(Box, { marginTop: 1 }),
            installRequests.map((request, index) => (React.createElement(Box, { key: index, flexDirection: "column", marginBottom: 1 },
                React.createElement(Box, { flexDirection: "row" },
                    React.createElement(Text, { color: getStatusColor(request.status) },
                        getStatusIcon(request.status),
                        " ",
                        request.name),
                    React.createElement(Box, { marginLeft: 2 },
                        React.createElement(Text, { color: "gray" }, request.status === 'downloading' || request.status === 'installing'
                            ? `${request.progress || 0}%`
                            : request.status))),
                request.status === 'downloading' && (React.createElement(Box, { marginTop: 0 },
                    React.createElement(Text, { color: "blue" },
                        '█'.repeat(Math.floor((request.progress || 0) / 5)),
                        '░'.repeat(20 - Math.floor((request.progress || 0) / 5))))),
                request.error && (React.createElement(Text, { color: "red", wrap: "wrap" },
                    "Error: ",
                    request.error))))))),
        React.createElement(Box, { marginTop: 2 },
            React.createElement(Text, { color: "yellow", bold: true }, "Popular Models:"),
            React.createElement(Box, { marginTop: 1, flexDirection: "column" },
                React.createElement(Text, { color: "gray" }, "\u2022 llama3.2:3b - Fast, lightweight general-purpose model"),
                React.createElement(Text, { color: "gray" }, "\u2022 phi3:mini - Microsoft's compact model"),
                React.createElement(Text, { color: "gray" }, "\u2022 qwen2.5:7b - Alibaba's advanced model"),
                React.createElement(Text, { color: "gray" }, "\u2022 deepseek-coder:6.7b - Specialized for coding"),
                React.createElement(Text, { color: "gray" }, "\u2022 mistral:7b - Efficient and capable"),
                React.createElement(Text, { color: "gray" }, "\u2022 gemma2:9b - Google's Gemma model"))),
        isInstalling && (React.createElement(Box, { marginTop: 1 },
            React.createElement(Text, { color: "yellow" }, "Installation in progress... Please wait.")))));
};
//# sourceMappingURL=ModelInstaller.js.map