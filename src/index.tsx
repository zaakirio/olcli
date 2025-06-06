#!/usr/bin/env node
import React from 'react';
import { render } from 'ink';
import { App } from './App.js';

// Handle command line arguments first
const args = process.argv.slice(2);

if (args.includes('--help') || args.includes('-h')) {
  console.log(`
🦙 Ollama Multi-Chat CLI

Usage:
  olcli [options]

Options:
  -h, --help               Display this help information
  -v, --version            Show version number
  --list-models            List all available Ollama models

Examples:
  olcli                    Start interactive main menu
  olcli --list-models      List available models
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
  // Check if stdin supports raw mode for interactive app
  if (!process.stdin.isTTY) {
    console.error('This application requires an interactive terminal (TTY)');
    process.exit(1);
  }
  
  // Start the interactive app
  render(<App />);
}