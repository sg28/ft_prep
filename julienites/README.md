# Julienites Alumni Network Platform

A modern alumni networking platform built with React/TypeScript frontend and FastAPI/PostgreSQL backend.

## Features

### User Features
- **User Profiles**: Complete profiles with education, work experience, skills
- **Authentication**: Secure JWT-based authentication with email verification
- **Social Networking**: Follow/unfollow users, create posts, like/comment
- **Search**: Advanced search across alumni by skills, location, graduation year
- **Notifications**: Real-time notifications for follows, likes, comments
- **Messaging**: Direct messaging between users
- **Events**: Create and join alumni events
- **Job Board**: Post and search for job opportunities

### Admin Features
- **User Management**: Manage user accounts and permissions
- **Content Moderation**: Moderate posts and comments
- **Analytics**: Platform usage statistics
- **Bulk Operations**: Import/export alumni data

## Tech Stack

### Frontend
- **React 19** with TypeScript
- **Tailwind CSS** for styling
- **React Router** for navigation
- **React Query** for data fetching
- **Zustand** for state management
- **Socket.io Client** for real-time features

### Backend
- **FastAPI** (Python) for REST API
- **PostgreSQL** with SQLAlchemy ORM
- **Redis** for caching and message broker
- **Celery** for background tasks
- **JWT** for authentication
- **WebSocket** for real-time communication

### Infrastructure
- **Docker** for containerization
- **Docker Compose** for local development
- **Nginx** as reverse proxy
- **PostgreSQL** as primary database
- **Redis** for caching and queues

## Project Structure

```
julienites/
├── frontend/                 # React frontend application
│   ├── public/              # Static files
│   ├── src/                 # Source code
│   │   ├── components/      # Reusable components
│   │   ├── pages/           # Page components
│   │   ├── contexts/        # React contexts
│   │   ├── hooks/           # Custom hooks
│   │   ├── services/        # API services
│   │   ├── utils/           # Utility functions
│   │   └── config/          # Configuration
│   ├── package.json
│   ├── Dockerfile
│   └── nginx.conf
│
├── backend/                  # FastAPI backend
│   ├── app/                 # Application code
│   │   ├── routers/         # API routers
│   │   ├── models/          # Database models
│   │   ├── schemas/         # Pydantic schemas
│   │   ├── crud/            # CRUD operations
│   │   ├── auth/            # Authentication
│   │   └── utils/           # Utilities
│   ├── requirements.txt
│   ├── Dockerfile
│   ├── .env.example
│   └── init.sql
│
├── docker-compose.yml       # Docker Compose configuration
├── .env.example             # Environment variables
└── README.md               # This file
```

## Quick Start

### Prerequisites
- Docker and Docker Compose
- Node.js 18+ (for frontend development)
- Python 3.11+ (for backend development)

### Using Docker (Recommended)

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd julienites
   ```

2. **Set up environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Start all services:**
   ```bash
   docker-compose up -d
   ```

4. **Access the applications:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - API Documentation: http://localhost:8000/api/docs
   - PostgreSQL: localhost:5432
   - Redis: localhost:6379

5. **View logs:**
   ```bash
   docker-compose logs -f
   ```

6. **Stop services:**
   ```bash
   docker-compose down
   ```

### Manual Setup

#### Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Create virtual environment:**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Set up environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

5. **Start PostgreSQL and Redis:**
   ```bash
   # Using Docker
   docker run -d --name postgres -p 5432:5432 -e POSTGRES_PASSWORD=postgres postgres:15
   docker run -d --name redis -p 6379:6379 redis:7-alpine
   ```

6. **Initialize database:**
   ```bash
   # Create database
   python -c "from app.database import create_tables; create_tables()"
   ```

7. **Run the backend:**
   ```bash
   uvicorn main:app --reload --host 0.0.0.0 --port 8000
   ```

#### Frontend Setup

1. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your configuration
   ```

4. **Run the frontend:**
   ```bash
   npm start
   ```

## Database Schema

The database is designed to handle thousands of users with efficient queries:

### Core Tables
- **users**: User accounts and profiles
- **education**: User education history
- **experience**: User work experience
- **skills**: Available skills
- **user_skills**: User-skill associations
- **posts**: User posts
- **post_likes**: Post likes
- **comments**: Post comments
- **user_connections**: Follower/following relationships
- **notifications**: User notifications

### Indexing Strategy
- All foreign keys are indexed
- Frequently searched fields (username, email, name) are indexed
- Composite indexes for common query patterns
- Full-text search on posts and bios

## API Documentation

Once the backend is running, access the interactive API documentation:
- **Swagger UI**: http://localhost:8000/api/docs
- **ReDoc**: http://localhost:8000/api/redoc

## Development

### Code Style

#### Backend (Python)
- Follow PEP 8 guidelines
- Use type hints
- Document functions with docstrings
- Use Black for code formatting

#### Frontend (TypeScript)
- Use ESLint and Prettier
- Follow React best practices
- Use functional components with hooks
- Type everything with TypeScript

### Testing

```bash
# Backend tests
cd backend
pytest

# Frontend tests
cd frontend
npm test
```

### Database Migrations

```bash
cd backend
# Generate migration
alembic revision --autogenerate -m "description"
# Apply migration
alembic upgrade head
```

## Deployment

### Production Considerations

1. **Security:**
   - Use HTTPS
   - Set strong secret keys
   - Enable CORS properly
   - Implement rate limiting
   - Regular security updates

2. **Performance:**
   - Database connection pooling
   - Redis caching
   - CDN for static assets
   - Load balancing

3. **Monitoring:**
   - Application logs
   - Database performance
   - Error tracking (Sentry)
   - Uptime monitoring

4. **Backup:**
   - Regular database backups
   - Disaster recovery plan
   - Test restore procedures

### Deployment Options

#### Option 1: Docker Swarm/Kubernetes
- Use the provided Dockerfiles
- Set up ingress controller
- Configure persistent volumes
- Implement auto-scaling

#### Option 2: Platform as a Service
- **Railway.app**: Easy deployment with PostgreSQL
- **Render.com**: Free tier available
- **Heroku**: Traditional PaaS
- **DigitalOcean App Platform**: Simple setup

#### Option 3: Traditional VPS
- Ubuntu/Debian server
- Nginx + Gunicorn for backend
- PM2 for frontend
- PostgreSQL and Redis

## Scaling Considerations

Given the requirement of thousands of users growing by hundreds each year:

### Database Scaling
1. **Vertical Scaling:** Upgrade PostgreSQL instance
2. **Read Replicas:** For read-heavy operations
3. **Connection Pooling:** Use PgBouncer
4. **Partitioning:** Partition large tables by date

### Application Scaling
1. **Microservices:** Split into smaller services
2. **Caching:** Extensive Redis caching
3. **CDN:** For static assets and media
4. **Queue:** Celery for background tasks

### Monitoring and Alerting
1. **Metrics:** Prometheus + Grafana
2. **Logs:** ELK stack or Loki
3. **APM:** New Relic or Datadog
4. **Alerts:** Set up critical alerts

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

Please ensure your code follows the existing style and includes appropriate tests.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

- **Documentation**: [API Docs](http://localhost:8000/api/docs)
- **Issues**: GitHub Issues
- **Email**: support@julienites.com
- **Community**: Discord/Slack (coming soon)

## Acknowledgments

- Built for Julien Day School alumni community
- Inspired by LinkedIn and Twitter
- Thanks to all contributors and testers