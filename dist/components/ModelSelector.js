import React, { useState, useEffect } from 'react';
import { Box, Text, useInput, Spacer } from 'ink';
import { OllamaService } from '../services/ollama.js';
export const ModelSelector = ({ onModelsSelected, onBack, onError }) => {
    const [models, setModels] = useState([]);
    const [selectedIndexes, setSelectedIndexes] = useState(new Set());
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
            }
            catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'Failed to load models';
                onError(errorMessage);
                setIsLoading(false);
            }
        };
        loadModels();
    }, []);
    useInput((input, key) => {
        if (isLoading || models.length === 0)
            return;
        if (key.escape) {
            onBack();
        }
        else if (key.upArrow) {
            setCurrentIndex(prev => Math.max(0, prev - 1));
        }
        else if (key.downArrow) {
            setCurrentIndex(prev => Math.min(models.length - 1, prev + 1));
        }
        else if (input === ' ') {
            setSelectedIndexes(prev => {
                const newSet = new Set(prev);
                if (newSet.has(currentIndex)) {
                    newSet.delete(currentIndex);
                }
                else {
                    newSet.add(currentIndex);
                }
                return newSet;
            });
        }
        else if (key.return) {
            if (selectedIndexes.size === 0) {
                onError('Please select at least one model');
                return;
            }
            const selectedModels = Array.from(selectedIndexes).map(index => ({
                name: models[index].name,
                status: 'idle',
                isSelected: true,
            }));
            onModelsSelected(selectedModels);
        }
    });
    if (isLoading) {
        return (React.createElement(Box, { flexDirection: "column", padding: 1 },
            React.createElement(Text, { color: "blue" }, "Loading available models...")));
    }
    if (models.length === 0) {
        return (React.createElement(Box, { flexDirection: "column", padding: 1 },
            React.createElement(Text, { color: "red" }, "No models found. Make sure Ollama is running and has models installed."),
            React.createElement(Text, { color: "gray" }, "Run 'ollama list' to see available models.")));
    }
    return (React.createElement(Box, { flexDirection: "column", padding: 1 },
        React.createElement(Box, { marginBottom: 1 },
            React.createElement(Text, { color: "green", bold: true }, "Select Models for Multi-Chat")),
        React.createElement(Box, { marginBottom: 1 },
            React.createElement(Text, { color: "gray" }, "Use \u2191/\u2193 to navigate, SPACE to select/deselect, ENTER to continue")),
        models.map((model, index) => (React.createElement(Box, { key: model.name, marginBottom: 0 },
            React.createElement(Text, { color: index === currentIndex ? 'blue' : 'white' },
                index === currentIndex ? '▶ ' : '  ',
                selectedIndexes.has(index) ? '☑' : '☐',
                " ",
                model.name),
            React.createElement(Spacer, null),
            React.createElement(Text, { color: "gray", dimColor: true },
                (model.size / (1024 * 1024 * 1024)).toFixed(1),
                "GB")))),
        React.createElement(Box, { marginTop: 1 },
            React.createElement(Text, { color: "yellow" },
                "Selected: ",
                selectedIndexes.size,
                " model",
                selectedIndexes.size !== 1 ? 's' : ''))));
};
//# sourceMappingURL=ModelSelector.js.map