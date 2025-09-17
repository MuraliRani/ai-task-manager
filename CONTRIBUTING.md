# Contributing to AI Task Manager

We love your input! We want to make contributing to AI Task Manager as easy and transparent as possible.

## Development Process

1. Fork the repo and create your branch from `main`
2. If you've added code that should be tested, add tests
3. If you've changed APIs, update the documentation
4. Ensure the test suite passes
5. Make sure your code lints
6. Issue that pull request!

## Development Setup

### Prerequisites
- Node.js 18+
- Python 3.11+
- PostgreSQL
- Git

### Setup Steps

1. **Clone your fork**
```bash
git clone https://github.com/YOUR_USERNAME/ai-task-manager.git
cd ai-task-manager
```

2. **Backend Setup**
```bash
cd backend
python -m venv .venv
.venv\Scripts\activate  # Windows
source .venv/bin/activate  # Linux/Mac
pip install -r requirements.txt
cp .env.example .env
# Edit .env with your configuration
```

3. **Frontend Setup**
```bash
cd ../frontend
npm install
cp .env.local.example .env.local
# Edit .env.local with your configuration
```

4. **Start Development Servers**
```bash
# Terminal 1: Backend
cd backend
python -m uvicorn app.main:app --reload

# Terminal 2: Frontend
cd frontend
npm run dev
```

## Pull Request Process

1. Update the README.md with details of changes if applicable
2. Update the version numbers in any examples files and the README.md
3. The PR will be merged once you have the sign-off of at least one maintainer

## Code Style

### Python (Backend)
- Follow PEP 8
- Use type hints
- Write docstrings for functions and classes
- Maximum line length: 88 characters (Black formatter)

### TypeScript/React (Frontend)
- Use TypeScript for all new code
- Follow React best practices
- Use functional components with hooks
- Use Tailwind CSS for styling

## Testing

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

## Bug Reports

Great bug reports tend to have:

- A quick summary and/or background
- Steps to reproduce
- What you expected would happen
- What actually happens
- Notes (possibly including why you think this might be happening)

## Feature Requests

We use GitHub issues to track feature requests. Please provide:

- Clear description of the feature
- Why this feature would be useful
- Possible implementation approach

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

## Questions?

Feel free to contact us if you have any questions about contributing!