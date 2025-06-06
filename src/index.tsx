#!/usr/bin/env node
import React from 'react';
import { render } from 'ink';
import { App } from './App.js';

// Check if stdin supports raw mode
if (!process.stdin.isTTY) {
  console.error('This application requires an interactive terminal (TTY)');
  process.exit(1);
}

// Handle command line arguments
const args = process.argv.slice(2);

if (args.includes('--help') || args.includes('-h')) {
  console.log(`
Ollama Multi-Chat CLI

Usage:
  ollama-chat [options]

Options:
  -h, --help               Display this help information
  -v, --version            Show version number
  --list-models            List all available Ollama models

Examples:
  ollama-chat              Start interactive model selection
  ollama-chat --list-models    List available models
`);
  process.exit(0);
}

if (args.includes('--version') || args.includes('-v')) {
  const { readFileSync } = await import('fs');
  const pkg = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'));
  console.log(pkg.version);
  process.exit(0);
}

if (args.includes('--list-models')) {
  const { OllamaService } = await import('./services/ollama.js');
  try {
    const service = new OllamaService();
    const response = await service.getAvailableModels();
    console.log('Available Ollama models:');
    response.models.forEach(model => {
      const sizeGB = (model.size / (1024 * 1024 * 1024)).toFixed(1);
      console.log(`  ${model.name} (${sizeGB}GB)`);
    });
  } catch (error) {
    console.error('Error fetching models:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
} else {
  // Start the interactive app
  render(<App />);
}