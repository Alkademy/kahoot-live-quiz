# Authentication Implementation Guide

This guide walks you through setting up and using the new authentication system for your Kahoot-style quiz application.

## Files Created & Modified

### Backend Files Created:
1. **`server/config/database.js`** - MySQL connection pool configuration
2. **`server/routes/auth.js`** - Authentication endpoints (signup, login, me)
3. **`server/middleware/auth.js`** - JWT verification middleware
4. **`server/database/setup.sql`** - Database and users table creation SQL
5. **`server/.env`** - Environment variables (add to .gitignore)
6. **`server/.env.example`** - Template for environment variables

### Backend Files Modified:
- **`server/server.js`** - Added auth routes and middleware

### Frontend Files Created:
1. **`client/src/pages/LoginPage.jsx`** - Login page component
2. **`client/src/pages/SignUpPage.jsx`** - Sign up page component
3. **`client/src/context/AuthContext.jsx`** - Authentication state management
4. **`client/src/styles/auth.css`** - Authentication page styling

### Frontend Files Modified:
- **`client/src/App.jsx`** - Added AuthProvider and new routes
- **`client/src/components/NavigationHeader.jsx`** - Shows login/logout or username
- **`client/.env`** - Added VITE_API_URL

## Packages Installed:
- **mysql2** - MySQL database driver with promise support
- **bcrypt** - Password hashing
- **jsonwebtoken** - JWT token generation and verification
- **dotenv** - Environment variable management

## Step 1: Set Up MySQL Database

### Option A: Using MySQL Command Line
```bash
# Connect to MySQL
mysql -u root -p

# Run the setup script
source server/database/setup.sql;
```

### Option B: Using MySQL Workbench or GUI Tool
1. Open your MySQL GUI client
2. Create a new query
3. Copy the contents of `server/database/setup.sql` and execute it

### SQL Commands (if running manually):
```sql
CREATE DATABASE IF NOT EXISTS kahoot_quiz;
USE kahoot_quiz;

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(255) NOT NULL UNIQUE,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_username (username)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS game_scores (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  game_pin VARCHAR(6) NOT NULL,
  score INT DEFAULT 0,
  correct_answers INT DEFAULT 0,
  total_questions INT DEFAULT 0,
  played_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_game_pin (game_pin)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

## Step 2: Configure Environment Variables

### Update `server/.env` file:
```env
# Server Configuration
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173

# MySQL Database
MYSQL_HOST=localhost
MYSQL_USER=root
MYSQL_PASSWORD=your_mysql_password
MYSQL_DATABASE=kahoot_quiz
MYSQL_PORT=3306

# JWT Secret (change this to a strong random string in production)
JWT_SECRET=your-super-secret-jwt-key-change-in-production
```

### Update `client/.env` file:
```env
VITE_SERVER_URL=http://localhost:5000
VITE_API_URL=http://localhost:5000
```

**IMPORTANT:** The `.env` file is already in `.gitignore`, so your credentials won't be committed to git.

## Step 3: Start the Application

From the project root directory:

```bash
# Install and run both client and server with one command
npm run dev

# Or run them separately in different terminals:
# Terminal 1:
npm run server

# Terminal 2:
npm run client
```

The application will be available at:
- Frontend: http://localhost:5173
- Backend: http://localhost:5000

## Testing Signup and Login

### Test Signup:
1. Open http://localhost:5173
2. Click "Sign Up"
3. Fill in the form:
   - Username: `testuser`
   - Email: `test@example.com`
   - Password: `password123`
   - Confirm Password: `password123`
4. Click "Sign Up"
5. You should be logged in and redirected to the home page
6. Your username should appear in the top navigation

### Test Login:
1. Click "Logout" in the top navigation
2. Click "Log In"
3. Enter credentials:
   - Email: `test@example.com`
   - Password: `password123`
4. Click "Log In"
5. You should be logged in and redirected to the home page

### Verify Database:
```sql
-- Check created users
USE kahoot_quiz;
SELECT id, username, email, created_at FROM users;
```

## API Endpoints

### POST /api/auth/signup
Creates a new user account.

**Request:**
```json
{
  "username": "testuser",
  "email": "test@example.com",
  "password": "password123",
  "confirmPassword": "password123"
}
```

**Response (201):**
```json
{
  "message": "Account created successfully",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "username": "testuser",
    "email": "test@example.com"
  }
}
```

### POST /api/auth/login
Logs in an existing user.

**Request:**
```json
{
  "email": "test@example.com",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "username": "testuser",
    "email": "test@example.com"
  }
}
```

### GET /api/auth/me
Gets the current logged-in user's information.

**Header:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "user": {
    "id": 1,
    "username": "testuser",
    "email": "test@example.com",
    "created_at": "2026-09-07T10:30:00.000Z"
  }
}
```

## Frontend Integration

### Using Authentication in Components:

```jsx
import { useAuth } from '../context/AuthContext';

export default function MyComponent() {
  const { user, isLoggedIn, logout } = useAuth();

  if (!isLoggedIn) {
    return <p>Please log in</p>;
  }

  return (
    <div>
      <p>Welcome, {user.username}!</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

### AuthContext Methods:
- `signup(username, email, password, confirmPassword)` - Returns boolean
- `login(email, password)` - Returns boolean
- `logout()` - Clears authentication
- `user` - Current user object (or null if not logged in)
- `token` - JWT token (stored in localStorage)
- `isLoggedIn` - Boolean indicating authentication status
- `isLoading` - Boolean for loading states
- `error` - Error message string

## Security Notes

1. **Password Storage:** All passwords are hashed with bcrypt (10 salt rounds)
2. **JWT Tokens:** 
   - Valid for 7 days from creation
   - Stored in localStorage on the frontend
   - Sent as `Authorization: Bearer <token>` header
3. **Environment Variables:** 
   - Never commit `.env` to git
   - Change `JWT_SECRET` to a strong random string in production
   - Use strong MySQL passwords in production
4. **HTTPS:** Use HTTPS in production (change CLIENT_URL from http to https)

## Troubleshooting

### MySQL Connection Error:
- Verify MySQL is running
- Check credentials in `.env`
- Verify database exists: `SHOW DATABASES;`
- Verify users table exists: `SHOW TABLES;`

### Login/Signup Not Working:
- Check browser console for errors
- Verify backend is running on port 5000
- Check `.env` files are properly configured
- Verify VITE_API_URL matches your backend URL

### Database Issues:
- Clear browser localStorage: DevTools → Application → Local Storage → Clear All
- Delete and recreate the database
- Re-run the SQL setup script

## Next Steps (Optional)

1. **Protect Routes:** Use `useAuth` hook to protect quiz pages that require login
2. **Link to User:** Associate quiz scores with user accounts in `game_scores` table
3. **User Profile:** Create a user profile page showing score history
4. **Session Persistence:** Token automatically restores on page refresh from localStorage
5. **Logout Cleanup:** Clear game state when logging out

## Architecture Overview

```
Frontend (React + Vite)
  ↓
AuthContext (manages auth state, stores JWT)
  ↓
API Calls to Backend
  ↓
Backend (Express.js + Socket.io)
  ↓
Auth Routes (signup, login, me)
  ↓
MySQL Database (users, game_scores tables)
```

The quiz functionality remains unchanged and can coexist with the authentication system. Users can be associated with their quiz games through the `user_id` foreign key in the `game_scores` table.
