# MySQL & SQLite Dual-Mode Support

Kosmos Energy VMS powered Vitotek Systems now automatically detects your environment:
- **Local (localhost)**: Uses **SQLite** (`database.sqlite`) for easy development.
- **Production (cPanel)**: Uses **MySQL** for reliability and performance.

## 1. Local Development (SQLite)
You don't need to do anything! When you run the app on `localhost`, it will automatically create a `database.sqlite` file in the `backend` folder.

## 3. Preparation for Deployment
I have already pre-configured the code to be production-ready:
1. **Dynamic API Paths**: The app now automatically detects if it's on `localhost` or a live server.
2. **SPA Routing**: A `.htaccess` file has been added to handle page refreshes on cPanel.

## 4. Step-by-Step Deployment

### Part A: Backend & Database
1. **Create Database**: In cPanel, use the **MySQL Database Wizard** to create a new database and user.
2. **Import Schema**: Open **phpMyAdmin**, select your new database, and import [backend/database.sql](file:///e:/gatekeeper/gatekeeper-vms/backend/database.sql).
3. **(Optional) Migrate Local Data**: If you want to move your local visitors/staff to cPanel:
   - Open a terminal in your local `backend` folder.
   - Run the dump script: `php dump_sqlite.php`.
   - This creates `local_data_dump.sql`.
   - Import this `local_data_dump.sql` into **phpMyAdmin** *after* you have imported the schema.
4. **Configure Connection**: Open `backend/db.php` in your cPanel file manager and update the database credentials (you've already done this for `skyweb_visitor`!).
   ```php
   $host = 'localhost'; // Usually localhost on cPanel
   $db_name = 'your_database_name';
   $username = 'your_database_user';
   $password = 'your_database_password';
   ```

### Part B: Frontend Build
1. Open your local terminal in the project root.
2. Run the build command:
   ```bash
   npm run build
   ```
3. This will create a `dist` folder.

### Part C: Uploading Files
1. Copy the contents of the `dist` folder to your cPanel `public_html` directory.
2. Upload the `backend` folder to `public_html/backend`.
3. Ensure the `.htaccess` file is uploaded to the root of `public_html`.

**Final File Structure on cPanel:**
- `public_html/`
  - `index.html` (from dist)
  - `assets/` (from dist)
  - `.htaccess`
  - `backend/`
    - `visitors.php`
    - `auth.php`
    - `db.php`
    - ...

---

## 5. Initial Login
The admin account is pre-created:
- **Email**: `admin@gatekeeper.com`
- **Password**: `admin123`

> [!IMPORTANT]
> Change the admin password immediately after your first login via the Staff Management section.

