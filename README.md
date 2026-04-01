# Node.js Vault Application

This project is a secure vault application built with Node.js and Express. It allows users to authenticate using username/password and OTP, then manage encrypted credentials. The app uses JWT for authentication, EJS for templating, and includes security features like rate limiting and token verification.

## Features

- User login with password and OTP verification
- JWT-based authentication with token verification middleware
- Secure storage of credentials with encryption
- Add, update, and delete vault entries
- Rate limiting to prevent abuse
- EJS templating for views (login, OTP, vault display)
- Uses MySQL and Socket.io dependencies (prepared for future extensions)

## Technologies Used

- Node.js
- Express
- EJS
- JWT (jsonwebtoken)
- bcrypt for password hashing
- Encryption utilities for vault data
- Rate limiting middleware
- dotenv for environment variables

## Setup Instructions

1. **Clone the repository**

```bash
git clone https://github.com/sammy750-cyber/VAULT
cd  VAULT
```

2. **Install dependencies**

Make sure you have Node.js installed. Then run:

```bash
npm install
```

3. **Create a `.env` file**

Create a `.env` file in the root directory with the following content:

```bash
cp .env.example .env
```

Configure `.env` file properly

4. **Run the application**

To start the server:

```bash
npm start
```

The server will start on the port specified in `.env` (default 40404).

5. **Access the application**

Open your browser and navigate to:

```
http://localhost:4040/auth/login
```


## Project Structure

- `app.js` - Main Express app setup
- `server.js` - Server startup script
- `routes/` - Express route handlers for authentication and vault
- `controllers/` - Business logic for vault operations
- `middleware/` - Middleware for token verification and rate limiting
- `auth/` - JWT token creation utilities
- `utils/` - Encryption and helper utilities
- `views/` - EJS templates for login, OTP, and vault display
- `data/vault.json` - JSON file storing encrypted vault entries

## Notes

- This project is a learning/demo project and not production-ready.
- Passwords and OTPs are handled simply for demonstration.
- Encryption keys and JWT secrets should be managed securely in production.

## License

MIT License

---

If you have any questions or issues, feel free to open an issue or contact the author.
