import React, { useState, useEffect } from 'react';
import { Box, Text, useInput } from 'ink';
import SelectInput from 'ink-select-input';
import TextInput from 'ink-text-input';
import { Profile } from '../types.js';
import { StorageService } from '../services/storage.js';

interface ProfileManagerProps {
  onSelectProfile: (profile: Profile | null) => void;
  onBack: () => void;
  onError: (error: string) => void;
}

type ProfileView = 'list' | 'create' | 'view';

export const ProfileManager: React.FC<ProfileManagerProps> = ({
  onSelectProfile,
  onBack,
  onError,
}) => {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [currentView, setCurrentView] = useState<ProfileView>('list');
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Create profile form state
  const [newProfileName, setNewProfileName] = useState('');
  const [newProfileDescription, setNewProfileDescription] = useState('');
  const [newProfilePrompt, setNewProfilePrompt] = useState('');
  const [createStep, setCreateStep] = useState<'name' | 'description' | 'prompt'>('name');

  const storageService = new StorageService();

  useEffect(() => {
    loadProfiles();
  }, []);

  const loadProfiles = () => {
    try {
      setIsLoading(true);
      const loadedProfiles = storageService.getProfiles();
      setProfiles(loadedProfiles);
    } catch (error) {
      onError('Failed to load profiles');
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
        setSelectedProfile(null);
        setNewProfileName('');
        setNewProfileDescription('');
        setNewProfilePrompt('');
        setCreateStep('name');
      }
    }
  });

  const handleCreateProfile = async () => {
    try {
      const newProfile = storageService.addProfile({
        name: newProfileName,
        description: newProfileDescription,
        systemPrompt: newProfilePrompt,
      });
      
      setProfiles(prev => [...prev, newProfile]);
      setCurrentView('list');
      setNewProfileName('');
      setNewProfileDescription('');
      setNewProfilePrompt('');
      setCreateStep('name');
    } catch (error) {
      onError('Failed to create profile');
    }
  };

  const handleDeleteProfile = (profile: Profile) => {
    if (profile.isBuiltIn) {
      onError('Cannot delete built-in profiles');
      return;
    }
    
    try {
      if (storageService.deleteProfile(profile.id)) {
        setProfiles(prev => prev.filter(p => p.id !== profile.id));
      }
    } catch (error) {
      onError('Failed to delete profile');
    }
  };

  if (isLoading) {
    return (
      <Box flexDirection="column" padding={1}>
        <Text color="blue">Loading profiles...</Text>
      </Box>
    );
  }

  if (currentView === 'create') {
    return (
      <Box flexDirection="column" padding={1}>
        <Text color="green" bold>Create New Profile</Text>
        <Text color="gray">ESC: Cancel</Text>
        <Box marginTop={1} />
        
        {createStep === 'name' && (
          <Box flexDirection="column">
            <Text>Profile Name:</Text>
            <TextInput
              value={newProfileName}
              onChange={setNewProfileName}
              onSubmit={() => {
                if (newProfileName.trim()) {
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
              value={newProfileDescription}
              onChange={setNewProfileDescription}
              onSubmit={() => {
                if (newProfileDescription.trim()) {
                  setCreateStep('prompt');
                }
              }}
            />
          </Box>
        )}
        
        {createStep === 'prompt' && (
          <Box flexDirection="column">
            <Text>System Prompt:</Text>
            <TextInput
              value={newProfilePrompt}
              onChange={setNewProfilePrompt}
              onSubmit={() => {
                if (newProfilePrompt.trim()) {
                  handleCreateProfile();
                }
              }}
            />
          </Box>
        )}
      </Box>
    );
  }

  if (currentView === 'view' && selectedProfile) {
    return (
      <Box flexDirection="column" padding={1}>
        <Text color="green" bold>{selectedProfile.name}</Text>
        <Text color="gray">ESC: Back to list</Text>
        <Box marginTop={1} />
        
        <Text color="cyan" bold>Description:</Text>
        <Text wrap="wrap">{selectedProfile.description}</Text>
        <Box marginTop={1} />
        
        <Text color="cyan" bold>System Prompt:</Text>
        <Text wrap="wrap">{selectedProfile.systemPrompt}</Text>
        <Box marginTop={1} />
        
        <Box flexDirection="row" gap={2}>
          <Text color="green">[ENTER] Use Profile</Text>
          {!selectedProfile.isBuiltIn && (
            <Text color="red">[D] Delete</Text>
          )}
        </Box>
      </Box>
    );
  }

  const profileItems = [
    { label: '(None) - No profile', value: 'none' },
    ...profiles.map(profile => ({
      label: `${profile.name} - ${profile.description}`,
      value: profile.id,
    })),
    { label: '+ Create New Profile', value: 'create' },
  ];

  return (
    <Box flexDirection="column" padding={1}>
      <Text color="green" bold>Profile Manager</Text>
      <Text color="gray">Select a profile to load context/persona</Text>
      <Text color="gray">ESC: Back to main menu</Text>
      <Box marginTop={1} />
      
      <SelectInput
        items={profileItems}
        onSelect={(item) => {
          if (item.value === 'none') {
            onSelectProfile(null);
          } else if (item.value === 'create') {
            setCurrentView('create');
          } else {
            const profile = profiles.find(p => p.id === item.value);
            if (profile) {
              setSelectedProfile(profile);
              setCurrentView('view');
            }
          }
        }}
      />
      
      {profiles.length > 0 && (
        <Box marginTop={1}>
          <Text color="cyan">Available Profiles: {profiles.length}</Text>
        </Box>
      )}
    </Box>
  );
};