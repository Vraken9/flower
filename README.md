# Flower Marketplace

A simple flower marketplace application with backend and frontend.

## Structure

- `backend/`: Node.js server with Express
- `frontend/`: Static HTML, CSS, and JavaScript

## Setup

1. Navigate to the backend directory:
   ```
   cd backend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the server:
   ```
   npm start
   ```

4. Open your browser and go to `http://localhost:3000` to view the frontend.

## Usage

The frontend fetches shop data from the backend API and displays it.

You can add shop data to `backend/data/shops.json` in the format:
```json
[
  {
    "name": "Shop Name",
    "description": "Shop description"
  }
]
```

## Troubleshooting

- Ensure Node.js is installed.
- If port 3000 is in use, change the PORT in `server.js`.