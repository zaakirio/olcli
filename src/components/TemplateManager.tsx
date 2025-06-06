import React, { useState, useEffect } from 'react';
import { Box, Text, useInput } from 'ink';
import SelectInput from 'ink-select-input';
import TextInput from 'ink-text-input';
import { Template, OllamaModel, ModelStatus } from '../types.js';
import { StorageService } from '../services/storage.js';
import { OllamaService } from '../services/ollama.js';

interface TemplateManagerProps {
  onSelectTemplate: (template: Template | null) => void;
  onLoadTemplate: (models: ModelStatus[]) => void;
  onBack: () => void;
  onError: (error: string) => void;
}

type TemplateView = 'list' | 'create' | 'view' | 'select-models';

export const TemplateManager: React.FC<TemplateManagerProps> = ({
  onSelectTemplate,
  onLoadTemplate,
  onBack,
  onError,
}) => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [availableModels, setAvailableModels] = useState<OllamaModel[]>([]);
  const [currentView, setCurrentView] = useState<TemplateView>('list');
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Create template form state
  const [newTemplateName, setNewTemplateName] = useState('');
  const [newTemplateDescription, setNewTemplateDescription] = useState('');
  const [selectedModelNames, setSelectedModelNames] = useState<string[]>([]);
  const [createStep, setCreateStep] = useState<'name' | 'description' | 'models'>('name');

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
    } catch (error) {
      onError('Failed to load templates or models');
    } finally {
      setIsLoading(false);
    }
  };

  useInput((input, key) => {
    if (key.escape) {
      if (currentView === 'list') {
        onBack();
      } else {
        setCurrentView('list');
        setSelectedTemplate(null);
        resetCreateForm();
      }
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
    } catch (error) {
      onError('Failed to create template');
    }
  };

  const handleDeleteTemplate = (template: Template) => {
    if (template.isBuiltIn) {
      onError('Cannot delete built-in templates');
      return;
    }
    
    try {
      if (storageService.deleteTemplate(template.id)) {
        setTemplates(prev => prev.filter(t => t.id !== template.id));
      }
    } catch (error) {
      onError('Failed to delete template');
    }
  };

  const handleLoadTemplate = (template: Template) => {
    const templateModels: ModelStatus[] = template.modelNames
      .filter(name => availableModels.some(m => m.name === name))
      .map(name => ({
        name,
        status: 'idle' as const,
        isSelected: true,
      }));
    
    if (templateModels.length === 0) {
      onError('No models from this template are available');
      return;
    }
    
    onLoadTemplate(templateModels);
  };

  if (isLoading) {
    return (
      <Box flexDirection="column" padding={1}>
        <Text color="blue">Loading templates...</Text>
      </Box>
    );
  }

  if (currentView === 'create') {
    return (
      <Box flexDirection="column" padding={1}>
        <Text color="green" bold>Create New Template</Text>
        <Text color="gray">ESC: Cancel</Text>
        <Box marginTop={1} />
        
        {createStep === 'name' && (
          <Box flexDirection="column">
            <Text>Template Name:</Text>
            <TextInput
              value={newTemplateName}
              onChange={setNewTemplateName}
              onSubmit={() => {
                if (newTemplateName.trim()) {
                  setCreateStep('description');
                }
              }}
            />
          </Box>
        )}
        
        {createStep === 'description' && (
          <Box flexDirection="column">
            <Text>Description:</Text>
            <TextInput
              value={newTemplateDescription}
              onChange={setNewTemplateDescription}
              onSubmit={() => {
                if (newTemplateDescription.trim()) {
                  setCreateStep('models');
                }
              }}
            />
          </Box>
        )}
        
        {createStep === 'models' && (
          <Box flexDirection="column">
            <Text>Select Models (Space to toggle, Enter when done):</Text>
            <Box marginTop={1} />
            <SelectInput
              items={availableModels.map(model => ({
                label: `${selectedModelNames.includes(model.name) ? '✓' : '○'} ${model.name}`,
                value: model.name,
              }))}
              onSelect={(item) => {
                const modelName = item.value;
                setSelectedModelNames(prev => 
                  prev.includes(modelName)
                    ? prev.filter(name => name !== modelName)
                    : [...prev, modelName]
                );
              }}
            />
            <Box marginTop={1}>
              <Text color="cyan">Selected: {selectedModelNames.length} models</Text>
              {selectedModelNames.length > 0 && (
                <Text color="green">[Enter] Create Template</Text>
              )}
            </Box>
          </Box>
        )}
      </Box>
    );
  }

  if (currentView === 'view' && selectedTemplate) {
    const availableCount = selectedTemplate.modelNames.filter(name => 
      availableModels.some(m => m.name === name)
    ).length;
    
    return (
      <Box flexDirection="column" padding={1}>
        <Text color="green" bold>{selectedTemplate.name}</Text>
        <Text color="gray">ESC: Back to list</Text>
        <Box marginTop={1} />
        
        <Text color="cyan" bold>Description:</Text>
        <Text wrap="wrap">{selectedTemplate.description}</Text>
        <Box marginTop={1} />
        
        <Text color="cyan" bold>Models ({selectedTemplate.modelNames.length}):</Text>
        {selectedTemplate.modelNames.map(name => (
          <Text key={name} color={availableModels.some(m => m.name === name) ? 'green' : 'red'}>
            {availableModels.some(m => m.name === name) ? '✓' : '✗'} {name}
          </Text>
        ))}
        <Box marginTop={1} />
        
        <Box flexDirection="row" gap={2}>
          <Text color="green">[ENTER] Load Template ({availableCount} available)</Text>
          {!selectedTemplate.isBuiltIn && (
            <Text color="red">[D] Delete</Text>
          )}
        </Box>
      </Box>
    );
  }

  const templateItems = [
    ...templates.map(template => ({
      label: `${template.name} - ${template.description} (${template.modelNames.length} models)`,
      value: template.id,
    })),
    { label: '+ Create New Template', value: 'create' },
  ];

  return (
    <Box flexDirection="column" padding={1}>
      <Text color="green" bold>Template Manager</Text>
      <Text color="gray">Select a template to load pre-configured model sets</Text>
      <Text color="gray">ESC: Back to main menu</Text>
      <Box marginTop={1} />
      
      <SelectInput
        items={templateItems}
        onSelect={(item) => {
          if (item.value === 'create') {
            setCurrentView('create');
          } else {
            const template = templates.find(t => t.id === item.value);
            if (template) {
              setSelectedTemplate(template);
              setCurrentView('view');
            }
          }
        }}
      />
      
      {templates.length > 0 && (
        <Box marginTop={1}>
          <Text color="cyan">Available Templates: {templates.length}</Text>
        </Box>
      )}
    </Box>
  );
};