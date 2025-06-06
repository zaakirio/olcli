import React, { useState, useEffect } from 'react';
import { Box, Text, useInput } from 'ink';
import SelectInput from 'ink-select-input';
import TextInput from 'ink-text-input';
import { StorageService } from '../services/storage.js';
import { OllamaService } from '../services/ollama.js';
const ModelSelector = ({ availableModels, selectedModelNames, onToggleModel, }) => {
    const [selectedIndex, setSelectedIndex] = useState(0);
    useInput((input, key) => {
        if (key.upArrow) {
            setSelectedIndex(prev => (prev > 0 ? prev - 1 : availableModels.length - 1));
        }
        else if (key.downArrow) {
            setSelectedIndex(prev => (prev < availableModels.length - 1 ? prev + 1 : 0));
        }
        else if (input === ' ') {
            const selectedModel = availableModels[selectedIndex];
            if (selectedModel) {
                onToggleModel(selectedModel.name);
            }
        }
    });
    return (React.createElement(Box, { flexDirection: "column" }, availableModels.map((model, index) => (React.createElement(Text, { key: model.name, color: index === selectedIndex ? 'cyan' : 'white', inverse: index === selectedIndex },
        selectedModelNames.includes(model.name) ? '✓' : '○',
        " ",
        model.name)))));
};
export const TemplateManager = ({ onSelectTemplate, onLoadTemplate, onBack, onError, }) => {
    const [templates, setTemplates] = useState([]);
    const [availableModels, setAvailableModels] = useState([]);
    const [currentView, setCurrentView] = useState('list');
    const [selectedTemplate, setSelectedTemplate] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    // Create template form state
    const [newTemplateName, setNewTemplateName] = useState('');
    const [newTemplateDescription, setNewTemplateDescription] = useState('');
    const [selectedModelNames, setSelectedModelNames] = useState([]);
    const [createStep, setCreateStep] = useState('name');
    const storageService = new StorageService();
    const ollamaService = new OllamaService();
    useEffect(() => {
        loadData();
    }, []);
    const loadData = async () => {
        try {
            setIsLoading(true);
            const [loadedTemplates, models] = await Promise.all([
                Promise.resolve(storageService.getTemplates()),
                ollamaService.getModels(),
            ]);
            setTemplates(loadedTemplates);
            setAvailableModels(models);
        }
        catch (error) {
            onError('Failed to load templates or models');
        }
        finally {
            setIsLoading(false);
        }
    };
    useInput((input, key) => {
        if (key.escape) {
            if (currentView === 'list') {
                onBack();
            }
            else {
                setCurrentView('list');
                setSelectedTemplate(null);
                resetCreateForm();
            }
        }
        // Handle Enter key for model selection completion
        if (currentView === 'create' && createStep === 'models' && key.return && selectedModelNames.length > 0) {
            handleCreateTemplate();
        }
        // Handle Enter key for template loading
        if (currentView === 'view' && selectedTemplate && key.return) {
            handleLoadTemplate(selectedTemplate);
        }
        // Handle delete key for template deletion
        if (currentView === 'view' && selectedTemplate && input.toLowerCase() === 'd' && !selectedTemplate.isBuiltIn) {
            handleDeleteTemplate(selectedTemplate);
            setCurrentView('list');
            setSelectedTemplate(null);
        }
    });
    const resetCreateForm = () => {
        setNewTemplateName('');
        setNewTemplateDescription('');
        setSelectedModelNames([]);
        setCreateStep('name');
    };
    const handleCreateTemplate = async () => {
        try {
            const newTemplate = storageService.addTemplate({
                name: newTemplateName,
                description: newTemplateDescription,
                modelNames: selectedModelNames,
            });
            setTemplates(prev => [...prev, newTemplate]);
            setCurrentView('list');
            resetCreateForm();
        }
        catch (error) {
            onError('Failed to create template');
        }
    };
    const handleDeleteTemplate = (template) => {
        if (template.isBuiltIn) {
            onError('Cannot delete built-in templates');
            return;
        }
        try {
            if (storageService.deleteTemplate(template.id)) {
                setTemplates(prev => prev.filter(t => t.id !== template.id));
            }
        }
        catch (error) {
            onError('Failed to delete template');
        }
    };
    const handleLoadTemplate = (template) => {
        const templateModels = template.modelNames
            .filter(name => availableModels.some(m => m.name === name))
            .map(name => ({
            name,
            status: 'idle',
            isSelected: true,
        }));
        if (templateModels.length === 0) {
            onError('No models from this template are available');
            return;
        }
        onLoadTemplate(templateModels);
    };
    if (isLoading) {
        return (React.createElement(Box, { flexDirection: "column", padding: 1 },
            React.createElement(Text, { color: "blue" }, "Loading templates...")));
    }
    if (currentView === 'create') {
        return (React.createElement(Box, { flexDirection: "column", padding: 1 },
            React.createElement(Text, { color: "green", bold: true }, "Create New Template"),
            React.createElement(Text, { color: "gray" }, "ESC: Cancel"),
            React.createElement(Box, { marginTop: 1 }),
            createStep === 'name' && (React.createElement(Box, { flexDirection: "column" },
                React.createElement(Text, null, "Template Name:"),
                React.createElement(TextInput, { value: newTemplateName, onChange: setNewTemplateName, onSubmit: () => {
                        if (newTemplateName.trim()) {
                            setCreateStep('description');
                        }
                    } }))),
            createStep === 'description' && (React.createElement(Box, { flexDirection: "column" },
                React.createElement(Text, null, "Description:"),
                React.createElement(TextInput, { value: newTemplateDescription, onChange: setNewTemplateDescription, onSubmit: () => {
                        if (newTemplateDescription.trim()) {
                            setCreateStep('models');
                        }
                    } }))),
            createStep === 'models' && (React.createElement(Box, { flexDirection: "column" },
                React.createElement(Text, null, "Select Models (Space to toggle, Enter when done):"),
                React.createElement(Box, { marginTop: 1 }),
                React.createElement(ModelSelector, { availableModels: availableModels, selectedModelNames: selectedModelNames, onToggleModel: (modelName) => {
                        setSelectedModelNames(prev => prev.includes(modelName)
                            ? prev.filter(name => name !== modelName)
                            : [...prev, modelName]);
                    } }),
                React.createElement(Box, { marginTop: 1 },
                    React.createElement(Text, { color: "cyan" },
                        "Selected: ",
                        selectedModelNames.length,
                        " models"),
                    selectedModelNames.length > 0 && (React.createElement(Text, { color: "green" }, "[Enter] Create Template")))))));
    }
    if (currentView === 'view' && selectedTemplate) {
        const availableCount = selectedTemplate.modelNames.filter(name => availableModels.some(m => m.name === name)).length;
        return (React.createElement(Box, { flexDirection: "column", padding: 1 },
            React.createElement(Text, { color: "green", bold: true }, selectedTemplate.name),
            React.createElement(Text, { color: "gray" }, "ESC: Back to list"),
            React.createElement(Box, { marginTop: 1 }),
            React.createElement(Text, { color: "cyan", bold: true }, "Description:"),
            React.createElement(Text, { wrap: "wrap" }, selectedTemplate.description),
            React.createElement(Box, { marginTop: 1 }),
            React.createElement(Text, { color: "cyan", bold: true },
                "Models (",
                selectedTemplate.modelNames.length,
                "):"),
            selectedTemplate.modelNames.map(name => (React.createElement(Text, { key: name, color: availableModels.some(m => m.name === name) ? 'green' : 'red' },
                availableModels.some(m => m.name === name) ? '✓' : '✗',
                " ",
                name))),
            React.createElement(Box, { marginTop: 1 }),
            React.createElement(Box, { flexDirection: "row", gap: 2 },
                React.createElement(Text, { color: "green" },
                    "[ENTER] Load Template (",
                    availableCount,
                    " available)"),
                !selectedTemplate.isBuiltIn && (React.createElement(Text, { color: "red" }, "[D] Delete")))));
    }
    const templateItems = [
        ...templates.map(template => ({
            label: `${template.name} - ${template.description} (${template.modelNames.length} models)`,
            value: template.id,
        })),
        { label: '+ Create New Template', value: 'create' },
    ];
    return (React.createElement(Box, { flexDirection: "column", padding: 1 },
        React.createElement(Text, { color: "green", bold: true }, "Template Manager"),
        React.createElement(Text, { color: "gray" }, "Select a template to load pre-configured model sets"),
        React.createElement(Text, { color: "gray" }, "ESC: Back to main menu"),
        React.createElement(Box, { marginTop: 1 }),
        React.createElement(SelectInput, { items: templateItems, onSelect: (item) => {
                if (item.value === 'create') {
                    setCurrentView('create');
                }
                else {
                    const template = templates.find(t => t.id === item.value);
                    if (template) {
                        setSelectedTemplate(template);
                        setCurrentView('view');
                    }
                }
            } }),
        templates.length > 0 && (React.createElement(Box, { marginTop: 1 },
            React.createElement(Text, { color: "cyan" },
                "Available Templates: ",
                templates.length)))));
};
//# sourceMappingURL=TemplateManager.js.map