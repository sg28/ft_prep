# Setup Instructions

## Prerequisites
- Node.js 16+ and npm
- Python 3.8+ and pip

## Run the Project

### Frontend
```bash
cd frontend/
npm install
npm start
```
Open: http://localhost:3000

### Backend (New Terminal)
```bash
cd backend/
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload
```
Backend: http://localhost:8000