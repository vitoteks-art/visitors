# Backend Setup Instructions

The backend of this application is built with PHP. To run it, you need to have PHP installed on your machine.

## Option 1: Using XAMPP (Recommended)
You have XAMPP installed, so you can use its PHP directly.

1. Open a terminal in the `backend` directory:
   ```bash
   cd backend
   ```
2. Run the server using XAMPP's PHP:
   ```powershell
   C:\xampp\php\php.exe -S localhost:8000
   ```

## Option 2: Standalone PHP
If you installed PHP separately and added it to your PATH:

1. Open a terminal in the `backend` directory.
2. Run:
   ```bash
   php -S localhost:8000
   ```

## Start the Frontend
In a separate terminal, run:

```bash
npm run dev
```

The application will now be able to communicate with the PHP backend.

## Troubleshooting
- If you see `CORS` errors, ensure the backend is running on port 8000.
- If the database is missing, it will be automatically created (`database.sqlite`) when you first check in or reload the page.
