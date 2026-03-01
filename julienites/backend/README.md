# Julienites Backend API

FastAPI backend for the Julienites alumni network platform.

## Features

- **User Authentication**: JWT-based authentication with refresh tokens
- **User Profiles**: Complete profiles with education, experience, and skills
- **Social Features**: Follow/unfollow users, posts, likes, comments
- **Search**: Advanced search across users, posts, and skills
- **Real-time Notifications**: WebSocket support for real-time updates
- **File Upload**: Profile pictures and post media
- **Admin Panel**: User management and moderation tools

## Tech Stack

- **Python 3.11**
- **FastAPI** - Modern, fast web framework
- **PostgreSQL** - Relational database
- **SQLAlchemy** - ORM for database operations
- **Alembic** - Database migrations
- **Redis** - Caching and message broker
- **Celery** - Background task processing
- **JWT** - JSON Web Tokens for authentication
- **Docker** - Containerization

## Project Structure

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py              # FastAPI application
│   ├── config.py            # Configuration settings
│   ├── database.py          # Database connection
│   ├── models.py            # SQLAlchemy models
│   ├── schemas.py           # Pydantic schemas
│   ├── auth.py              # Authentication utilities
│   ├── crud.py              # CRUD operations
│   ├── routers/             # API routers
│   │   ├── __init__.py
│   │   ├── auth.py          # Authentication endpoints
│   │   ├── users.py         # User management
│   │   ├── posts.py         # Posts and comments
│   │   ├── connections.py   # Followers/following
│   │   └── search.py        # Search functionality
│   └── utils/               # Utility functions
├── requirements.txt         # Python dependencies
├── Dockerfile              # Docker configuration
├── .env.example           # Environment variables template
└── README.md              # This file
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - Login with email/password
- `POST /api/auth/register` - Register new user
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Get current user info

### Users
- `GET /api/users/` - List users (paginated)
- `GET /api/users/{user_id}` - Get user profile
- `PUT /api/users/{user_id}` - Update user profile
- `GET /api/users/{user_id}/education` - Get user education
- `POST /api/users/{user_id}/education` - Add education
- `GET /api/users/{user_id}/experience` - Get user experience
- `POST /api/users/{user_id}/experience` - Add experience
- `GET /api/users/{user_id}/skills` - Get user skills
- `POST /api/users/{user_id}/skills` - Add skill

### Posts
- `GET /api/posts/` - Get feed posts
- `GET /api/posts/{post_id}` - Get specific post
- `POST /api/posts/` - Create post
- `PUT /api/posts/{post_id}` - Update post
- `DELETE /api/posts/{post_id}` - Delete post
- `POST /api/posts/{post_id}/like` - Like post
- `DELETE /api/posts/{post_id}/like` - Unlike post
- `GET /api/posts/{post_id}/comments` - Get post comments
- `POST /api/posts/{post_id}/comments` - Add comment

### Connections
- `GET /api/connections/followers` - Get my followers
- `GET /api/connections/following` - Get users I follow
- `POST /api/connections/follow/{user_id}` - Follow user
- `DELETE /api/connections/follow/{user_id}` - Unfollow user
- `GET /api/connections/suggestions` - Suggested users to follow

### Search
- `GET /api/search/users` - Search users
- `GET /api/search/posts` - Search posts
- `GET /api/search/global` - Global search
- `GET /api/search/alumni` - Advanced alumni search
- `GET /api/search/autocomplete` - Autocomplete suggestions

## Setup and Installation

### Prerequisites
- Python 3.11+
- PostgreSQL 15+
- Redis 7+
- Docker (optional)

### Local Development

1. **Clone and navigate to backend directory:**
   ```bash
   cd julienites/backend
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
   # Using Docker (recommended)
   docker-compose up -d postgres redis
   
   # Or install locally
   # PostgreSQL: https://www.postgresql.org/download/
   # Redis: https://redis.io/download/
   ```

6. **Run database migrations:**
   ```bash
   # Create tables
   python -c "from app.database import create_tables; create_tables()"
   ```

7. **Run the development server:**
   ```bash
   uvicorn main:app --reload --host 0.0.0.0 --port 8000
   ```

8. **Access the API documentation:**
   - Swagger UI: http://localhost:8000/api/docs
   - ReDoc: http://localhost:8000/api/redoc

### Using Docker

1. **Build and run with Docker Compose:**
   ```bash
   cd julienites
   docker-compose up -d
   ```

2. **View logs:**
   ```bash
   docker-compose logs -f backend
   ```

3. **Stop services:**
   ```bash
   docker-compose down
   ```

## Database Migrations

For production, use Alembic for database migrations:

```bash
# Initialize Alembic (first time only)
alembic init migrations

# Create a new migration
alembic revision --autogenerate -m "Description of changes"

# Apply migrations
alembic upgrade head

# Rollback last migration
alembic downgrade -1
```

## Testing

```bash
# Run tests
pytest

# Run tests with coverage
pytest --cov=app tests/

# Run specific test file
pytest tests/test_auth.py -v
```

## Deployment

### Production Considerations

1. **Security:**
   - Change default SECRET_KEY in production
   - Use HTTPS
   - Set DEBUG=False
   - Configure CORS properly
   
2. **Database:**
   - Use connection pooling
   - Regular backups
   - Monitoring and alerts
   
3. **Performance:**
   - Enable Redis caching
   - Use CDN for static files
   - Implement rate limiting
   
4. **Monitoring:**
   - Log aggregation
   - Application performance monitoring
   - Health checks

### Deployment Options

- **Docker Swarm/Kubernetes** - For container orchestration
- **AWS ECS/EKS** - Managed container services
- **Heroku** - Platform as a Service
- **DigitalOcean App Platform** - Simple deployment
- **Railway/Render** - Developer-friendly platforms

## Environment Variables

See `.env.example` for all available environment variables.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support, email support@julienites.com or create an issue in the repository.