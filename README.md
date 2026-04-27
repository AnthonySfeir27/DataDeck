# DataDeck

Notes and activity management and tracking app in the form of cards and tags.

## Tech Stack

- **Frontend**: Angular 17
- **Backend**: Django 4.2 with Django REST Framework
- **Database**: MongoDB (Cloud) via PyMongo

## Project Structure

```
datadeck/
├── backend/          # Django backend
│   ├── api/          # API application
│   │   ├── db.py     # MongoDB connection utility
│   │   ├── views.py  # API views
│   │   └── urls.py   # API routing
│   ├── datadeck/     # Django project settings
│   ├── manage.py     # Django management script
│   └── requirements.txt
└── frontend/         # Angular frontend
    ├── src/
    │   ├── app/
    │   ├── index.html
    │   ├── main.ts
    │   └── styles.css
    ├── angular.json
    ├── package.json
    └── tsconfig.json
```

## Setup Instructions

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create a virtual environment:
   ```bash
   python -m venv venv
   ```

3. Activate the virtual environment:
   
   **On Windows PowerShell:**
   ```powershell
   .\venv\Scripts\activate
   ```
   
   **On Windows Command Prompt:**
   ```cmd
   venv\Scripts\activate
   ```
   
   **On Linux/Mac:**
   ```bash
   source venv/bin/activate
   ```

4. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

5. Set MongoDB connection string (optional):
   
   **On Windows PowerShell:**
   ```powershell
   $env:MONGODB_URI="your-mongodb-cloud-connection-string"
   ```
   
   **On Windows Command Prompt:**
   ```cmd
   set MONGODB_URI=your-mongodb-cloud-connection-string
   ```
   
   **On Linux/Mac:**
   ```bash
   export MONGODB_URI="your-mongodb-cloud-connection-string"
   ```

6. Run migrations (for Django's built-in tables):
   ```bash
   python manage.py migrate
   ```

7. Start the Django development server:
   ```bash
   python manage.py runserver
   ```

   The backend will run at `http://localhost:8000`

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the Angular development server:
   ```bash
   npm start
   ```

   The frontend will run at `http://localhost:4200`

## MongoDB Configuration

This project uses PyMongo to connect directly to MongoDB. Django's built-in SQLite database is used only for Django's authentication and session tables.

### For MongoDB Cloud (Atlas):

1. Create a MongoDB Atlas account at https://www.mongodb.com/cloud/atlas
2. Create a new cluster
3. Create a database user with password
4. Whitelist your IP address (or use 0.0.0.0/0 for development)
5. Get your connection string from the "Connect" button
6. Set the MONGODB_URI environment variable:
   
   **Windows PowerShell:**
   ```powershell
   $env:MONGODB_URI="mongodb+srv://username:password@cluster.mongodb.net/?retryWrites=true&w=majority"
   ```

### For Local MongoDB:

1. Install MongoDB Community Server from https://www.mongodb.com/try/download/community
2. Start MongoDB service
3. The app defaults to `mongodb://localhost:27017/` if no MONGODB_URI is set

## Usage

1. Start the backend server (port 8000)
2. Start the frontend server (port 4200)
3. Open your browser and navigate to `http://localhost:4200`
4. You should see the welcome screen with "Welcome to DataDeck" message

## API Endpoints

- `GET /api/welcome/` - Returns welcome message

## MongoDB Collections

MongoDB collections will be created automatically when you start adding data. The database utility is located in `backend/api/db.py` and provides:

- `get_db()` - Returns the MongoDB database instance
- `get_collection(collection_name)` - Returns a specific collection

Example usage in views:
```python
from api.db import get_collection

def my_view(request):
    cards = get_collection('cards')
    # Use the collection...
```

## Common Issues

**Issue**: `source` is not recognized in PowerShell  
**Solution**: Use `.\venv\Scripts\activate` instead

**Issue**: Dependency conflicts with djongo  
**Solution**: This project uses PyMongo directly, which is more reliable and actively maintained

**Issue**: Cannot connect to MongoDB  
**Solution**: Make sure MongoDB is running locally or check your MongoDB Atlas connection string
