# 🦙 Ollama Multi-Chat CLI

A powerful command-line interface for simultaneous conversations with multiple Ollama AI models. Compare responses, leverage different model strengths, and manage your AI interactions with profiles, templates, and chat persistence.

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![Node](https://img.shields.io/badge/node-%3E%3D22.0.0-green.svg)
![License](https://img.shields.io/badge/license-MIT-blue.svg)

## ✨ Features

### 🚀 **Multi-Model Chat**
- Chat with multiple Ollama models simultaneously
- Side-by-side response comparison
- Real-time streaming responses
- Optimized performance with reduced screen flickering

### 👤 **Profiles System**
- Pre-built personas (Senior Architect, Developer, Code Reviewer, Teacher)
- Custom profile creation with system prompts
- Automatic context injection into conversations
- Profile management (create, view, delete)

### 📋 **Templates**
- Pre-configured model collections (General, Coding, Creative, Analysis)
- Custom template creation
- Intelligent model availability detection
- Quick-start with curated model sets

### ⬇️ **Model Management**
- Install new Ollama models directly from CLI
- Progress tracking for downloads
- Popular model suggestions
- Error handling and retry logic

### 💾 **Chat Persistence**
- Export conversations with full metadata
- Import previous chat sessions
- Preserve profiles and templates in exports
- Organized file storage system

## 🔧 Prerequisites

- **Node.js 22+** (required for ESM support)
- **Ollama** installed and running locally
- At least one Ollama model downloaded

### Installing Ollama

```bash
# macOS
brew install ollama

# Linux
curl -fsSL https://ollama.ai/install.sh | sh

# Windows
# Download from https://ollama.ai/download
```

### Installing Models

```bash
# Popular lightweight models
ollama pull llama3.2:3b
ollama pull phi3:mini
ollama pull qwen2.5:7b

# Coding-focused models
ollama pull deepseek-coder:6.7b
ollama pull codellama:7b
```

## 📦 Installation

### Option 1: Clone and Build
```bash
git clone <repository-url>
cd ollama-cli
npm install
npm run build
npm link  # Optional: for global installation
```

### Option 2: Direct Usage
```bash
npm install
npm run dev  # Development mode with hot reload
```

## 🚀 Usage

### Starting the Application
```bash
# If globally installed
ollama-chat

# Or run directly
npm start

# Development mode
npm run dev
```

### Main Menu Navigation

The application starts with a main menu offering these options:

```
🦙 Ollama Multi-Chat CLI
Chat with multiple AI models simultaneously

Current Settings:
Profile: Senior Solutions Architect
Template: Code Assistant

Main Menu:
→ 🚀 Start Chat Session
  👤 Manage Profiles  
  📋 Manage Templates
  ⬇️ Install Models
  💾 Export/Import Chats
```

## 📚 Feature Guide

### 🚀 Starting a Chat Session

1. Select **"Start Chat Session"** from main menu
2. Choose models using arrow keys and spacebar
3. Press Enter to start chatting
4. Type messages and see responses from all selected models
5. Use ESC to return to model selection

**Chat Controls:**
- `ESC` - Back to model selection
- `Enter` - Send message
- Real-time streaming responses

### 👤 Managing Profiles

Profiles add context and personality to your AI interactions:

**Built-in Profiles:**
- **Senior Solutions Architect** - System design expertise
- **Full-Stack Developer** - Practical coding solutions  
- **Code Reviewer** - Focus on quality and best practices
- **Technical Teacher** - Clear explanations and examples

**Creating Custom Profiles:**
1. Select **"Manage Profiles"**
2. Choose **"+ Create New Profile"**
3. Enter name, description, and system prompt
4. Profile automatically applies to new conversations

### 📋 Using Templates

Templates provide curated model collections for specific use cases:

**Built-in Templates:**
- **General Purpose** - `llama3.2:3b`, `phi3:mini`, `qwen2.5:7b`
- **Code Assistant** - `deepseek-coder:6.7b`, `codellama:7b`, `starcoder2:3b`
- **Creative Writing** - `llama3.2:3b`, `mistral:7b`, `gemma2:9b`
- **Data Analysis** - `qwen2.5:7b`, `llama3.1:8b`, `phi3:medium`

**Creating Custom Templates:**
1. Select **"Manage Templates"**
2. Choose **"+ Create New Template"**
3. Enter name and description
4. Select models for the template
5. Template appears in future selections

### ⬇️ Installing Models

Add new models without leaving the application:

```
Model Name: llama3.2:3b
█████████████░░░░░░░ 65%
Downloading...

Popular Models:
• llama3.2:3b - Fast, lightweight general-purpose model
• phi3:mini - Microsoft's compact model  
• qwen2.5:7b - Alibaba's advanced model
• deepseek-coder:6.7b - Specialized for coding
```

### 💾 Chat Export/Import

Preserve and share your conversations:

**Exporting:**
1. During or after a chat session
2. Select **"Export/Import Chats"** → **"Export Current Chat"**
3. Enter a descriptive name
4. File saved to `~/.ollama-multi-chat/exports/`

**Importing:**
1. Select **"Import Chat"** from export menu
2. Choose from available exported chats
3. Conversation, profile, and template restored
4. Continue where you left off

## ⚙️ Configuration

### Storage Locations

All data stored in `~/.ollama-multi-chat/`:
```
~/.ollama-multi-chat/
├── profiles.json          # User profiles
├── templates.json         # Model templates  
└── exports/               # Exported chats
    ├── chat-session-1.json
    └── chat-session-2.json
```

### Model Timeouts

Automatic timeouts based on model size:
- **Small models** (3B params): 2 minutes
- **Medium models** (7-13B): 3 minutes  
- **Large models** (24B+): 5 minutes

## 🔧 Development

### Scripts
```bash
npm run build      # Compile TypeScript
npm run dev        # Development with hot reload
npm run typecheck  # Type checking only
npm run lint       # ESLint checking
npm test          # Run tests
```

### Project Structure
```
src/
├── components/           # React components
│   ├── ChatInterface.tsx
│   ├── ModelSelector.tsx
│   ├── ProfileManager.tsx
│   ├── TemplateManager.tsx
│   └── ...
├── services/            # Business logic
│   ├── ollama.ts       # Ollama API client
│   └── storage.ts      # Data persistence
├── types.ts            # TypeScript definitions
└── App.tsx            # Main application
```

## 🐛 Troubleshooting

### Common Issues

**"Failed to connect to Ollama"**
```bash
# Check if Ollama is running
ollama list

# Start Ollama service
ollama serve
```

**"No models available"**
```bash
# Install a model first
ollama pull llama3.2:3b

# Verify installation
ollama list
```

**"Model timeout errors"**
- Large models need time to load initially
- Subsequent requests are faster
- Consider using smaller models for testing

**"Screen flickering during responses"**
- Updated with performance optimizations
- Reduced update frequency and debouncing
- Contact support if issues persist

### Performance Tips

1. **Start with smaller models** (3B parameters) for faster responses
2. **Use templates** to quickly switch between model sets
3. **Profile system** reduces repetitive context setting
4. **Export important chats** to preserve valuable conversations

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Ollama** team for the excellent local AI model runtime
- **Ink** for the beautiful terminal UI framework
- **React** for the component architecture
- Contributors and testers

---

**Built with ❤️ for the AI development community**

For issues, feature requests, or questions, please open an issue on GitHub.