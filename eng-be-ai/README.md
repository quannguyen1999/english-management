# English Management AI Backend

A Flask-based backend service for English language management with AI capabilities.

## Prerequisites

- Python 3.11 or higher
- Poetry (Python dependency manager)
- Git Bash (for Windows users)

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd eng-be-ai
```

2. Install dependencies using Poetry:
```bash
poetry install
```

## Running the Application

### Using Git Bash (Recommended for Windows)

1. **Activate the virtual environment:**
```bash
source venv/Scripts/activate
```

2. **Run the application:**
```bash
python main.py
```

### Alternative: Using PowerShell

1. **Activate the virtual environment:**
```powershell
.\venv\Scripts\Activate.ps1
```

2. **Run the application:**
```powershell
python main.py
```

## Project Structure

```
eng-be-ai/
├── config/          # Configuration files
├── controller/      # API controllers
├── service/         # Business logic services
├── templates/       # HTML templates
├── main.py         # Application entry point
└── pyproject.toml  # Poetry configuration
```

## Development

- The application uses Flask as the web framework
- SQLAlchemy for database operations
- Poetry for dependency management
- Black for code formatting
- Flake8 for linting

## Environment Variables

Copy the example environment file and configure your settings:
```bash
cp env.example .env
```

Edit `.env` with your configuration values.

## API Endpoints

The service provides AI-powered endpoints for English language management. Check the controller files for available endpoints.

## Contributing

1. Ensure code is formatted with Black
2. Run linting with Flake8
3. Follow the existing code structure and patterns
