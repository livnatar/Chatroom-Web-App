# Chatroom Web App

A web application built with Node.js, Express, and EJS that allows users to register, log in, and participate in a basic chatroom. Includes session management, form validation, and a REST API.

## Features

### ✅ User Registration (`/register`)
- Input fields: First name, Last name, Email, Password, Confirm Password
- Validations:
    - Required fields
    - Password confirmation
    - Unique email (case-insensitive)
    - Field length constraints
- Prevents duplicate registration

### ✅ User Login (`/login`)
- Input: Email and Password
- Validations:
    - Email and password match existing user
    - Case-insensitive email comparison
- On success:
    - Session is stored in a cookie for 30 seconds
    - Redirects to the chatroom

### ✅ Chatroom (`/chatroom`)
- Visible only to logged-in users
- Displays: `Welcome <FirstName>`
- Allows sending and viewing messages
- Messages include sender's name and timestamp
- Messages auto-refresh every 10 seconds (polling)
- Logout option clears the session

### ✅ Backend API
- RESTful endpoints for:
    - Registering users
    - Logging in/out
    - Sending and retrieving chat messages
    - Admin-only edit/delete operations

### ✅ Input Validation
- Both client-side (HTML5) and server-side checks
- Case-insensitive email handling
- Clean error messages for invalid inputs

## Getting Started

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/chatroom-web-app.git
   ```

2. Navigate to the project folder:
   ```bash
   cd chatroom-web-app
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

4. Start the server:
   ```bash
   node app.js
   ```

## Technologies Used

- Node.js
- Express.js
- EJS (Embedded JavaScript)
- HTML5 + CSS3
- JavaScript (Frontend)
- REST API

## Notes

- This app does not use a database. User data and chat messages are stored in memory.
- For a production app, you would need to:
    - Add persistent storage (e.g., MongoDB or PostgreSQL)
    - Improve security (e.g., hashing passwords, longer session time)
    - Use websockets for real-time chat

---

