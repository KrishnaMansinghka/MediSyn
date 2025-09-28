#!/usr/bin/env python3
"""
MediSyn Application Launcher
Single file to start both backend and frontend services
"""

import os
import sys
import subprocess
import signal
import time
import threading
import webbrowser
from pathlib import Path

# Configuration
BACKEND_AUTH_PORT = 8001
FRONTEND_PORT = 5173  # Fixed port as configured in vite.config.ts
PROJECT_ROOT = Path(__file__).parent

# Process tracking
processes = []

def signal_handler(sig, frame):
    """Handle Ctrl+C gracefully"""
    print("\n🛑 Shutting down MediSyn services...")
    for process in processes:
        try:
            if process.poll() is None:  # Process is still running
                print(f"   Terminating process {process.pid}...")
                process.terminate()
                process.wait(timeout=5)
        except subprocess.TimeoutExpired:
            print(f"   Force killing process {process.pid}...")
            process.kill()
        except Exception as e:
            print(f"   Error stopping process: {e}")
    
    print("✅ All services stopped. Goodbye!")
    sys.exit(0)

def check_dependencies():
    """Check if required dependencies are installed"""
    print("🔍 Checking dependencies...")
    
    # Check Python virtual environment
    venv_python = PROJECT_ROOT / ".venv" / "bin" / "python"
    if not venv_python.exists():
        print("❌ Python virtual environment not found!")
        print("   Please run: python -m venv .venv && source .venv/bin/activate && pip install -r requirements.txt")
        return False
    
    # Check if auth API dependencies are installed
    try:
        result = subprocess.run([
            str(venv_python), "-c", 
            "import fastapi, uvicorn, psycopg2, jwt; print('Backend dependencies OK')"
        ], capture_output=True, text=True, timeout=10)
        
        if result.returncode != 0:
            print("❌ Backend dependencies missing!")
            print("   Please run: pip install fastapi uvicorn psycopg2-binary PyJWT python-dotenv pydantic email-validator")
            return False
    except Exception as e:
        print(f"❌ Error checking backend dependencies: {e}")
        return False
    
    # Check Node.js and npm
    try:
        subprocess.run(["node", "--version"], capture_output=True, check=True)
        subprocess.run(["npm", "--version"], capture_output=True, check=True)
    except (subprocess.CalledProcessError, FileNotFoundError):
        print("❌ Node.js or npm not found!")
        print("   Please install Node.js from https://nodejs.org/")
        return False
    
    # Check if frontend dependencies are installed
    frontend_node_modules = PROJECT_ROOT / "frontend" / "node_modules"
    if not frontend_node_modules.exists():
        print("📦 Installing frontend dependencies...")
        try:
            subprocess.run(["npm", "install"], cwd=PROJECT_ROOT / "frontend", check=True)
        except subprocess.CalledProcessError:
            print("❌ Failed to install frontend dependencies!")
            return False
    
    print("✅ All dependencies checked!")
    return True

def start_auth_backend():
    """Start the authentication backend API"""
    print(f"🚀 Starting Authentication API on port {BACKEND_AUTH_PORT}...")
    
    auth_dir = PROJECT_ROOT / "backend" / "auth"
    venv_python = PROJECT_ROOT / ".venv" / "bin" / "python"
    
    if not (auth_dir / "auth_api.py").exists():
        print("❌ Authentication API file not found!")
        return None
    
    try:
        # Set environment variables
        env = os.environ.copy()
        env["PYTHONPATH"] = str(PROJECT_ROOT)
        
        process = subprocess.Popen([
            str(venv_python), "auth_api.py"
        ], 
        cwd=auth_dir,
        env=env,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        universal_newlines=True,
        bufsize=1
        )
        
        processes.append(process)
        print(f"✅ Authentication API started (PID: {process.pid})")
        
        # Start a thread to monitor the process output
        def monitor_backend():
            for line in iter(process.stdout.readline, ''):
                if line.strip():
                    print(f"[AUTH-API] {line.strip()}")
        
        backend_thread = threading.Thread(target=monitor_backend, daemon=True)
        backend_thread.start()
        
        return process
    
    except Exception as e:
        print(f"❌ Failed to start authentication API: {e}")
        return None

def start_frontend():
    """Start the frontend development server"""
    print(f"🎨 Starting Frontend on port {FRONTEND_PORT}...")
    
    frontend_dir = PROJECT_ROOT / "frontend"
    
    if not (frontend_dir / "package.json").exists():
        print("❌ Frontend package.json not found!")
        return None
    
    try:
        # Check if we should use npm or yarn
        if (frontend_dir / "yarn.lock").exists():
            cmd = ["yarn", "dev"]
        else:
            cmd = ["npm", "run", "dev"]
        
        process = subprocess.Popen(
            cmd,
            cwd=frontend_dir,
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            universal_newlines=True,
            bufsize=1
        )
        
        processes.append(process)
        print(f"✅ Frontend started (PID: {process.pid})")
        
        # Start a thread to monitor the process output
        def monitor_frontend():
            for line in iter(process.stdout.readline, ''):
                if line.strip():
                    print(f"[FRONTEND] {line.strip()}")
        
        frontend_thread = threading.Thread(target=monitor_frontend, daemon=True)
        frontend_thread.start()
        
        return process
    
    except Exception as e:
        print(f"❌ Failed to start frontend: {e}")
        return None

def wait_for_service(url, service_name, timeout=30):
    """Wait for a service to be available"""
    import urllib.request
    import urllib.error
    
    print(f"⏳ Waiting for {service_name} to be ready...")
    
    for i in range(timeout):
        try:
            urllib.request.urlopen(url, timeout=2)
            print(f"✅ {service_name} is ready!")
            return True
        except (urllib.error.URLError, urllib.error.HTTPError):
            time.sleep(1)
            if i % 5 == 0 and i > 0:
                print(f"   Still waiting for {service_name}... ({i}s elapsed)")
    
    print(f"❌ {service_name} failed to start within {timeout} seconds")
    return False

def open_browser():
    """Open the application in the default browser"""
    frontend_url = f"http://localhost:{FRONTEND_PORT}"
    print(f"🌐 Opening browser at {frontend_url}")
    
    try:
        webbrowser.open(frontend_url)
    except Exception as e:
        print(f"⚠️ Could not open browser automatically: {e}")
        print(f"   Please open {frontend_url} manually")

def print_status():
    """Print application status and URLs"""
    print("\n" + "="*60)
    print("🎉 MediSyn Application is Running!")
    print("="*60)
    print(f"🔒 Authentication API: http://localhost:{BACKEND_AUTH_PORT}")
    print(f"🎨 Frontend Application: http://localhost:{FRONTEND_PORT}")
    print("="*60)
    print("📖 Available endpoints:")
    print(f"   • API Health: http://localhost:{BACKEND_AUTH_PORT}/")
    print(f"   • API Docs: http://localhost:{BACKEND_AUTH_PORT}/docs")
    print(f"   • Login Page: http://localhost:{FRONTEND_PORT}/medicare/login")
    print(f"   • Signup Page: http://localhost:{FRONTEND_PORT}/medicare/signup")
    print("="*60)
    print("💡 Press Ctrl+C to stop all services")
    print("="*60)

def create_requirements_txt():
    """Create requirements.txt if it doesn't exist"""
    requirements_file = PROJECT_ROOT / "requirements.txt"
    
    if not requirements_file.exists():
        print("📝 Creating requirements.txt...")
        requirements_content = """# MediSyn Backend Dependencies
fastapi==0.104.1
uvicorn[standard]==0.24.0
psycopg2-binary==2.9.9
PyJWT==2.8.0
python-dotenv==1.0.0
pydantic[email]==2.5.0
requests==2.31.0
"""
        requirements_file.write_text(requirements_content)
        print("✅ requirements.txt created!")

def main():
    """Main application launcher"""
    print("🏥 MediSyn Application Launcher")
    print("="*40)
    
    # Register signal handler for graceful shutdown
    signal.signal(signal.SIGINT, signal_handler)
    signal.signal(signal.SIGTERM, signal_handler)
    
    try:
        # Create requirements.txt if needed
        create_requirements_txt()
        
        # Check dependencies
        if not check_dependencies():
            print("\n❌ Dependency check failed. Please install missing dependencies.")
            return 1
        
        # Start services
        print("\n🚀 Starting MediSyn services...")
        
        # Start backend
        backend_process = start_auth_backend()
        if not backend_process:
            print("❌ Failed to start backend services")
            return 1
        
        # Wait for backend to be ready
        if not wait_for_service(f"http://localhost:{BACKEND_AUTH_PORT}/", "Authentication API"):
            print("❌ Backend failed to start properly")
            return 1
        
        # Start frontend
        frontend_process = start_frontend()
        if not frontend_process:
            print("❌ Failed to start frontend")
            return 1
        
        # Wait for frontend to be ready
        time.sleep(5)  # Give frontend time to compile
        if not wait_for_service(f"http://localhost:{FRONTEND_PORT}/", "Frontend"):
            print("❌ Frontend failed to start properly")
            return 1
        
        # Print status
        print_status()
        
        # Open browser
        time.sleep(2)
        open_browser()
        
        # Keep the main thread alive
        print("\n🔄 Services are running... (Press Ctrl+C to stop)")
        while True:
            time.sleep(1)
            
            # Check if processes are still running
            for process in processes[:]:  # Copy list to avoid modification during iteration
                if process.poll() is not None:
                    print(f"⚠️ Process {process.pid} has stopped unexpectedly")
                    processes.remove(process)
            
            if not processes:
                print("❌ All processes have stopped. Exiting...")
                break
    
    except KeyboardInterrupt:
        signal_handler(signal.SIGINT, None)
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        signal_handler(signal.SIGTERM, None)
        return 1
    
    return 0

if __name__ == "__main__":
    sys.exit(main())