# MediSyn

🏥 **MediSyn** - A comprehensive medical management system with PostgreSQL backend and React frontend.

## 🚀 Quick Start

### Option 1: One-Command Start (Recommended)
```bash
./start.sh
```

### Option 2: Manual Start
```bash
python3 main.py
```

## 📋 Prerequisites

Before running MediSyn, ensure you have:

1. **Python 3.8+** installed
2. **Node.js 16+** and **npm** installed
3. **PostgreSQL database** configured (see [Database Setup](#database-setup))

## 🛠️ Installation & Setup

### 1. Clone the Repository
```bash
git clone https://github.com/KrishnaMansinghka/MediSyn.git
cd MediSyn
```

### 2. Database Setup
Make sure your `.env` file exists in the root directory with PostgreSQL credentials:
```env
DB_HOST="your-postgres-host"
DB_NAME="your-database-name"
DB_USER="your-username"
DB_PASSWORD="your-password"
DB_PORT="5432"
```

### 3. Test Database Connection
```bash
# Activate virtual environment
source .venv/bin/activate

# Test PostgreSQL connection
python database/test_postgres_connection.py
```

### 4. Run the Application

#### Quick Start (Automatic Setup)
```bash
./start.sh
```
This script will:
- ✅ Create Python virtual environment if needed
- ✅ Install all Python dependencies
- ✅ Install frontend dependencies
- ✅ Start both backend and frontend services
- ✅ Open browser automatically

#### Manual Start
```bash
python3 main.py
```

## 🌐 Application URLs

Once running, access:

- **Frontend Application**: http://localhost:5173
- **Authentication API**: http://localhost:8001
- **API Documentation**: http://localhost:8001/docs
- **Login Page**: http://localhost:5173/medicare/login
- **Signup Page**: http://localhost:5173/medicare/signup

## 🏗️ Architecture

### Backend Services
- **Authentication API** (Port 8001): JWT-based auth with PostgreSQL
- **Chat API** (Port 8000): Medical chatbot service
- **Database**: PostgreSQL with 5 main tables

### Frontend
- **React + TypeScript**: Modern UI with Vite
- **Tailwind CSS**: Styling framework
- **shadcn/ui**: Component library

## 📁 Project Structure

```
MediSyn/
├── main.py              # Single-file application launcher
├── start.sh             # Quick start script
├── .env                 # Database configuration
├── backend/
│   ├── auth/
│   │   ├── auth_api.py         # Authentication API
│   │   └── test_auth_api.py    # API tests
│   └── Chatbot/
│       ├── api_server.py       # Chat API
│       └── chatbot.py          # Chat logic
├── database/
│   ├── postgres_utils.py       # Database utilities
│   ├── test_postgres_connection.py  # DB tests
│   └── script.txt              # SQL schema
├── frontend/
│   ├── src/
│   │   ├── lib/
│   │   │   ├── auth-service.ts # Auth service
│   │   │   └── auth.ts         # Auth utilities
│   │   └── medicare/
│   │       └── pages/          # Login/Signup pages
│   └── package.json
└── requirements.txt     # Python dependencies
```

## 🔧 Development

### Running Individual Services

#### Backend Authentication API
```bash
cd backend/auth
source ../../.venv/bin/activate
python auth_api.py
```

#### Frontend Development Server
```bash
cd frontend
npm run dev
```

#### Database Tests
```bash
source .venv/bin/activate
python database/test_postgres_connection.py
```

## 🧪 Testing

### Test Authentication API
```bash
source .venv/bin/activate
python backend/auth/test_auth_api.py
```

### Test Database Connection
```bash
source .venv/bin/activate
python database/test_postgres_connection.py
```

## 🔐 Authentication

The system supports two user types:

### Doctor Registration
```json
{
  "email": "doctor@clinic.com",
  "password": "password123",
  "role": "doctor",
  "clinic_name": "My Clinic",
  "doctor_name": "Dr. Smith"
}
```

### Patient Registration
```json
{
  "email": "patient@email.com",
  "password": "password123",
  "role": "patient",
  "name": "John Doe",
  "date_of_birth": "1990-01-01",
  "address": "123 Main St"
}
```

## 🐛 Troubleshooting

### Common Issues

1. **Database Connection Failed**
   ```bash
   # Check your .env file configuration
   # Test connection
   python database/test_postgres_connection.py
   ```

2. **Port Already in Use**
   ```bash
   # Kill existing processes
   pkill -f "auth_api.py"
   pkill -f "vite"
   ```

3. **Missing Dependencies**
   ```bash
   # Reinstall Python dependencies
   source .venv/bin/activate
   pip install -r requirements.txt
   
   # Reinstall frontend dependencies
   cd frontend
   npm install
   ```

4. **Authentication API Not Starting**
   ```bash
   # Check if all dependencies are installed
   source .venv/bin/activate
   python -c "import fastapi, uvicorn, psycopg2, jwt; print('All dependencies OK')"
   ```

## 🛑 Stopping the Application

- Press `Ctrl+C` in the terminal running the application
- All services (backend + frontend) will stop gracefully

## 📚 API Documentation

Once the backend is running, visit:
- **Swagger UI**: http://localhost:8001/docs
- **ReDoc**: http://localhost:8001/redoc

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

---

**Need Help?** Check the troubleshooting section or run the test scripts to diagnose issues.