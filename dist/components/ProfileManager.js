import React, { useState, useEffect } from 'react';
import { Box, Text, useInput } from 'ink';
import SelectInput from 'ink-select-input';
import TextInput from 'ink-text-input';
import { StorageService } from '../services/storage.js';
export const ProfileManager = ({ onSelectProfile, onBack, onError, }) => {
    const [profiles, setProfiles] = useState([]);
    const [currentView, setCurrentView] = useState('list');
    const [selectedProfile, setSelectedProfile] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    // Create profile form state
    const [newProfileName, setNewProfileName] = useState('');
    const [newProfileDescription, setNewProfileDescription] = useState('');
    const [newProfilePrompt, setNewProfilePrompt] = useState('');
    const [createStep, setCreateStep] = useState('name');
    const storageService = new StorageService();
    useEffect(() => {
        loadProfiles();
    }, []);
    const loadProfiles = () => {
        try {
            setIsLoading(true);
            const loadedProfiles = storageService.getProfiles();
            setProfiles(loadedProfiles);
        }
        catch (error) {
            onError('Failed to load profiles');
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
                setSelectedProfile(null);
                setNewProfileName('');
                setNewProfileDescription('');
                setNewProfilePrompt('');
                setCreateStep('name');
            }
        }
        // Handle Enter key for profile selection/actions
        if (currentView === 'view' && selectedProfile && key.return) {
            onSelectProfile(selectedProfile);
        }
        // Handle delete key for profile deletion
        if (currentView === 'view' && selectedProfile && input.toLowerCase() === 'd' && !selectedProfile.isBuiltIn) {
            handleDeleteProfile(selectedProfile);
            setCurrentView('list');
            setSelectedProfile(null);
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
        }
        catch (error) {
            onError('Failed to create profile');
        }
    };
    const handleDeleteProfile = (profile) => {
        if (profile.isBuiltIn) {
            onError('Cannot delete built-in profiles');
            return;
        }
        try {
            if (storageService.deleteProfile(profile.id)) {
                setProfiles(prev => prev.filter(p => p.id !== profile.id));
            }
        }
        catch (error) {
            onError('Failed to delete profile');
        }
    };
    if (isLoading) {
        return (React.createElement(Box, { flexDirection: "column", padding: 1 },
            React.createElement(Text, { color: "blue" }, "Loading profiles...")));
    }
    if (currentView === 'create') {
        return (React.createElement(Box, { flexDirection: "column", padding: 1 },
            React.createElement(Text, { color: "green", bold: true }, "Create New Profile"),
            React.createElement(Text, { color: "gray" }, "ESC: Cancel"),
            React.createElement(Box, { marginTop: 1 }),
            createStep === 'name' && (React.createElement(Box, { flexDirection: "column" },
                React.createElement(Text, null, "Profile Name:"),
                React.createElement(TextInput, { value: newProfileName, onChange: setNewProfileName, onSubmit: () => {
                        if (newProfileName.trim()) {
                            setCreateStep('description');
                        }
                    } }))),
            createStep === 'description' && (React.createElement(Box, { flexDirection: "column" },
                React.createElement(Text, null, "Description:"),
                React.createElement(TextInput, { value: newProfileDescription, onChange: setNewProfileDescription, onSubmit: () => {
                        if (newProfileDescription.trim()) {
                            setCreateStep('prompt');
                        }
                    } }))),
            createStep === 'prompt' && (React.createElement(Box, { flexDirection: "column" },
                React.createElement(Text, null, "System Prompt:"),
                React.createElement(TextInput, { value: newProfilePrompt, onChange: setNewProfilePrompt, onSubmit: () => {
                        if (newProfilePrompt.trim()) {
                            handleCreateProfile();
                        }
                    } })))));
    }
    if (currentView === 'view' && selectedProfile) {
        return (React.createElement(Box, { flexDirection: "column", padding: 1 },
            React.createElement(Text, { color: "green", bold: true }, selectedProfile.name),
            React.createElement(Text, { color: "gray" }, "ESC: Back to list"),
            React.createElement(Box, { marginTop: 1 }),
            React.createElement(Text, { color: "cyan", bold: true }, "Description:"),
            React.createElement(Text, { wrap: "wrap" }, selectedProfile.description),
            React.createElement(Box, { marginTop: 1 }),
            React.createElement(Text, { color: "cyan", bold: true }, "System Prompt:"),
            React.createElement(Text, { wrap: "wrap" }, selectedProfile.systemPrompt),
            React.createElement(Box, { marginTop: 1 }),
            React.createElement(Box, { flexDirection: "row", gap: 2 },
                React.createElement(Text, { color: "green" }, "[ENTER] Use Profile"),
                !selectedProfile.isBuiltIn && (React.createElement(Text, { color: "red" }, "[D] Delete")))));
    }
    const profileItems = [
        { label: '(None) - No profile', value: 'none' },
        ...profiles.map(profile => ({
            label: `${profile.name} - ${profile.description}`,
            value: profile.id,
        })),
        { label: '+ Create New Profile', value: 'create' },
    ];
    return (React.createElement(Box, { flexDirection: "column", padding: 1 },
        React.createElement(Text, { color: "green", bold: true }, "Profile Manager"),
        React.createElement(Text, { color: "gray" }, "Select a profile to load context/persona"),
        React.createElement(Text, { color: "gray" }, "ESC: Back to main menu"),
        React.createElement(Box, { marginTop: 1 }),
        React.createElement(SelectInput, { items: profileItems, onSelect: (item) => {
                if (item.value === 'none') {
                    onSelectProfile(null);
                }
                else if (item.value === 'create') {
                    setCurrentView('create');
                }
                else {
                    const profile = profiles.find(p => p.id === item.value);
                    if (profile) {
                        setSelectedProfile(profile);
                        setCurrentView('view');
                    }
                }
            } }),
        profiles.length > 0 && (React.createElement(Box, { marginTop: 1 },
            React.createElement(Text, { color: "cyan" },
                "Available Profiles: ",
                profiles.length)))));
};
//# sourceMappingURL=ProfileManager.js.map