# Frontend - Chat Interface

React-based chat interface for the Internal Developer Assistant Chatbot.

## Features

- Clean, modern chat UI
- Real-time messaging
- Message history
- Intent display
- Source document references
- Responsive design
- Dark/light mode support

## Setup

### Prerequisites

- Node.js 18+ and npm

### Installation

```bash
npm install
```

### Environment Configuration

Create `.env.local` file:

```bash
REACT_APP_API_URL=http://localhost:8000
```

### Development

```bash
npm start
```

Runs the app at http://localhost:3000

### Build

```bash
npm run build
```

Builds the app for production to the `build` folder.

## Project Structure

```
frontend/
├── public/
│   └── index.html
├── src/
│   ├── App.js                    # Main app component
│   ├── index.js                  # Entry point
│   ├── components/
│   │   ├── ChatInterface.js      # Main chat component
│   │   ├── MessageList.js        # Message display
│   │   ├── MessageInput.js       # Input field
│   │   └── SourceCard.js         # Source document display
│   ├── services/
│   │   └── api.js                # API service
│   ├── hooks/
│   │   └── useChat.js            # Chat logic hook
│   └── styles/
│       └── Chat.css              # Styling
└── package.json
```

## Available Scripts

- `npm start` - Start development server
- `npm test` - Run tests
- `npm run build` - Build for production
- `npm run eject` - Eject from Create React App

## API Integration

The frontend communicates with the FastAPI backend through:
- REST endpoints for chat messages
- WebSocket for streaming responses
- Intent detection API
