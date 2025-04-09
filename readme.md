## 1. Local Development Environment

### Prerequisites
- Docker and Docker Compose installed
- Git repository cloned locally

### Steps to Run Locally
1. Navigate to the development environment directory:
   ```bash
   cd deploy/docker-compose/dev
   ```

2. Start the containers:
   ```bash
   docker-compose up --build
   ```
   Note: Initial startup takes approximately 5 minutes for all services to be ready

3. Access the application:
   ```bash
   http://localhost:80
   ```

4. Login:
   ```bash
   admin/Password
   <another account>/Password
   ```

## 2. Production Environment

### Steps to Deploy
1. Navigate to the production environment directory:
   ```bash
   cd deploy/docker-compose/prod
   ```

2. Start the production containers:
   ```bash
   docker-compose up
   ```

3. Access the production application:
   ```bash
   http://localhost:4200
   ```
4. Login:
   ```bash
   admin/Password
   <another account>/Password
   ```

## 3. API Documentation

The following Swagger UI endpoints are available for API documentation:

### Project Service
# english-management
