# 🚀 AI Task Manager

An intelligent task management application powered by AI, featuring a modern React frontend and FastAPI backend with real-time WebSocket communication.

## ✨ Features

- 🤖 **AI-Powered Chat Interface** - Interact with tasks using natural language
- 📚 **React.js Learning Assistant** - Built-in tutor for learning React concepts
- ⚡ **Real-time Updates** - WebSocket-based live task synchronization
- 🌓 **Dark/Light Mode** - Modern UI with theme switching
- 📱 **Responsive Design** - Works seamlessly on all devices
- 🔍 **Advanced Filtering** - Smart task filtering and search
- 📊 **Task Analytics** - Track your productivity

## 🏗️ Architecture

```
┌─────────────────┐    WebSocket    ┌─────────────────┐
│   Frontend      │◄──────────────►│   Backend       │
│   (Next.js)     │                 │   (FastAPI)     │
│                 │                 │                 │
│ • React 18      │                 │ • Python 3.11+ │
│ • TypeScript    │                 │ • PostgreSQL   │
│ • Tailwind CSS │                 │ • SQLAlchemy   │
│ • WebSocket     │                 │ • Gemini AI    │
└─────────────────┘                 └─────────────────┘
```

## 🛠️ Technology Stack

### Frontend
- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **State Management**: React Hooks
- **Real-time**: WebSocket API

### Backend
- **Framework**: FastAPI
- **Language**: Python 3.11+
- **Database**: PostgreSQL
- **ORM**: SQLAlchemy
- **AI Integration**: Google Gemini API
- **Real-time**: WebSocket
- **Data Validation**: Pydantic

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- Python 3.11+
- PostgreSQL
- Google Gemini API Key

### 1. Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/ai-task-manager.git
cd ai-task-manager
```

### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv .venv

# Activate virtual environment
# Windows:
.venv\Scripts\activate
# Linux/Mac:
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Set up environment variables
copy .env.example .env
# Edit .env file with your configuration
```

### 3. Database Setup

```bash
# Create PostgreSQL database
createdb taskdb

# Update .env file with your database credentials:
DATABASE_URL=postgresql://username:password@localhost:5432/taskdb
```

### 4. Frontend Setup

```bash
# Navigate to frontend directory
cd ../frontend

# Install dependencies
npm install

# Set up environment variables
copy .env.local.example .env.local
# Edit .env.local with your configuration
```

### 5. Start the Application

```bash
# Terminal 1: Start Backend
cd backend
python -m uvicorn app.main:app --reload --host localhost --port 8000

# Terminal 2: Start Frontend
cd frontend
npm run dev
```

### 6. Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs

## ⚙️ Environment Variables

### Backend (.env)
```env
# Database Configuration
DATABASE_URL=postgresql://username:password@localhost:5432/taskdb

# AI Configuration
GEMINI_API_KEY=your_gemini_api_key_here

# Application Settings
DEBUG=True
HOST=localhost
PORT=8000

# CORS Settings
ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
NEXT_PUBLIC_WS_URL=ws://localhost:8000/api/v1/ws
```

## 🐳 Docker Deployment

```bash
# Build and start all services
docker-compose up --build

# Or for production
docker-compose -f docker-compose.prod.yml up --build -d
```

## 📖 API Documentation

The API documentation is automatically generated and available at:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

### Key Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/tasks` | Get all tasks |
| POST | `/api/v1/tasks` | Create a new task |
| PUT | `/api/v1/tasks/{id}` | Update a task |
| DELETE | `/api/v1/tasks/{id}` | Delete a task |
| POST | `/api/v1/chat` | Chat with AI assistant |
| WS | `/api/v1/ws` | WebSocket connection |

## 🎯 Usage Examples

### Chat with AI Assistant

```javascript
// Send a message to the AI
const response = await fetch('/api/v1/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ message: 'Create a task to learn React hooks' })
});
```

### WebSocket Connection

```javascript
const ws = new WebSocket('ws://localhost:8000/api/v1/ws');
ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('Received:', data);
};
```

## 🧪 Testing

### Backend Tests
```bash
cd backend
pytest
```

### Frontend Tests
```bash
cd frontend
npm test
```

## 📁 Project Structure

```
ai-task-manager/
├── backend/                 # FastAPI backend
│   ├── app/
│   │   ├── api/            # API routes
│   │   ├── db/             # Database configuration
│   │   ├── models/         # SQLAlchemy models
│   │   ├── schemas/        # Pydantic schemas
│   │   ├── services/       # Business logic & AI integration
│   │   └── utils/          # Utilities
│   ├── requirements.txt    # Python dependencies
│   └── Dockerfile         # Backend container
├── frontend/               # Next.js frontend
│   ├── src/
│   │   ├── app/           # App router pages
│   │   ├── components/    # React components
│   │   ├── hooks/         # Custom hooks
│   │   ├── types/         # TypeScript definitions
│   │   └── utils/         # Utility functions
│   ├── package.json       # Node.js dependencies
│   └── Dockerfile        # Frontend container
├── docker-compose.yml     # Development setup
├── docker-compose.prod.yml # Production setup
└── README.md             # This file
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙋‍♂️ Support

If you have any questions or need help, please:

1. Check the [Issues](https://github.com/YOUR_USERNAME/ai-task-manager/issues) page
2. Create a new issue with detailed information
3. Join our [Discussions](https://github.com/YOUR_USERNAME/ai-task-manager/discussions)

## 🎉 Acknowledgments

- [FastAPI](https://fastapi.tiangolo.com/) - Modern, fast web framework for building APIs
- [Next.js](https://nextjs.org/) - The React Framework for the Web
- [Google Gemini](https://ai.google.dev/) - AI capabilities
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- [PostgreSQL](https://www.postgresql.org/) - Advanced open-source database

---

**Made with ❤️ for learning and productivity**