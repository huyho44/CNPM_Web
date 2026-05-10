# Smart Parking Management System

A full-stack web application designed for managing smart parking zones, RFID cards, and temporary ticket issuance. The system features a modern React frontend and an Express/MySQL backend.

## Project Structure

This is a monorepo containing two main parts:
- `backend/`: The Node.js + Express backend service connected to MySQL.
- `src/` (Frontend): The React + Vite frontend application.

---

## 1. Backend Setup

The backend serves the API for parking management and connects directly to the MySQL database.

### Prerequisites
- Node.js (v18+)
- MySQL (v8.0+)

### Database Setup
1. Open MySQL Workbench or your preferred SQL client.
2. Run the provided SQL script to set up the schema and sample data:
   - Import and execute the `SParking.sql` file located in the root directory.
   - This will create the `smartparking` database, tables, and stored procedures.

### Installation
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure environment variables:
   - Make sure you have a `.env` file in the `backend/` directory.
   - Example `.env` contents:
     ```env
     # Database
     DB_HOST=localhost
     DB_PORT=3306
     DB_USER=root
     DB_PASSWORD=your_mysql_password
     DB_NAME=smartparking
     
     # Server
     APP_PORT=3001
     NODE_ENV=development
     
     # CORS — comma-separated list of allowed frontend origins
     CORS_ORIGINS=http://localhost:3000,http://localhost:3001
     ```

### Running the Backend
To start the backend development server (with hot-reloading):
```bash
npm run dev
```
The backend will run on `http://localhost:3001`.

---

## 2. Frontend Setup

The frontend provides the user interface for simulators, ticket management, and dashboards.

### Prerequisites
- Node.js (v18+)

### Installation
1. Navigate to the root directory (where the frontend `package.json` is located).
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure environment variables (optional for local dev, but required if you change backend ports):
   - You can create a `.env.local` file in the root directory if needed.
   - Ensure the API client knows where the backend is (defaults to `http://localhost:3001` in the code).

### Running the Frontend
To start the Vite development server:
```bash
npm run dev
```
The frontend will run on `http://localhost:3000`.

---

## Development Workflow

To work on both simultaneously, open two terminal windows:

**Terminal 1 (Backend):**
```bash
cd backend
npm run dev
```

**Terminal 2 (Frontend):**
```bash
npm run dev
```

## Current Features ( continuously updated )
- **RFID Access Simulator:** Simulate scanning RFID cards at different entry/exit gates.
- **Temporary Ticket Management:** Issue and process temporary tickets for visitors without RFID cards.
- **Real-time Logs:** View live access logs fetched dynamically from the database.
- **Cross-Origin Support:** Fully configured CORS to allow local development across different ports.
