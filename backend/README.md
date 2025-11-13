# Event Platform Backend

A robust Node.js/Express.js backend for managing events, user authentication, and question-answer functionality. This backend serves both admin and user interfaces, providing RESTful API endpoints for event management, user authentication, question handling, and result processing.

## Features

- **User Authentication**: JWT-based authentication for both admin and regular users
- **Role-based Access Control**: Separate routes and permissions for admin and regular users
- **Event Management**: Create, update, and manage events and rounds
- **Question Bank**: CRUD operations for questions
- **Answer Validation**: Endpoint for validating user answers
- **Result Processing**: Track and manage user results
- **CORS Support**: Configured for secure cross-origin requests

## Prerequisites

- Node.js (v22.18.0)
- MongoDB (Atlas or local instance)
- npm

## Installation

1. Clone the repository
   ```bash
   git clone <repository-url>
   cd event-platform/backend
   ```

2. Install dependencies
   ```bash
   npm install

   ```

3. Set up environment variables
   Create a `.env` file in the root directory with the following variables:
   ```
      FRONTEND_URL ='http://localhost:5173'
      ADMIN_URL='http://localhost:5174'
      MONGO_URI='mongodb://localhos...cquiz'  //use this for local instance
      MONGO_REMOTE='mongodb+srv://vikasg....true&w=majority' //use this for cloud (PRESENT USED IN CONFIG)
      JWT_SECRET=73a872.....0bfcf1d5
   ```

## Available Scripts

- `npm run server` - Start the development server with nodemon
- `npm start` - Start the production server
- `npm test` - Run tests (to be implemented)

## API Endpoints

### Authentication
- `POST /api/adminauth/login` - Admin login
- `POST /api/adminauth/setadmin` - Set a new admin user (admin only)
- `DELETE /api/adminauth/:id` - Delete an admin user (admin only)
- `GET /api/adminauth/` - Get all admin users (admin only)
- `POST /api/auth/add` - Add a new user (admin only)
- `DELETE /api/auth/remove` - Remove a user (admin only)

### User Management (Admin Only)
- `GET /api/users` - Get all users
- `GET /api/users/round/:roundId` - Get users by round
- `GET /api/users/:id` - Get user by ID
- `PATCH /api/users/:id/promote` - Promote user to next round
- `PATCH /api/users/:id/deactivate` - Deactivate a user
- `PATCH /api/users/:id/depromote` - Move user to previous round
- `PATCH /api/users/:id/activate` - Reactivate a user

### Round Management (Admin Only)
- `GET /api/rounds` - Get all rounds
- `POST /api/rounds` - Create new round
- `PATCH /api/rounds/:id/activate` - Activate a round (deactivates others)
- `PATCH /api/rounds/:id/time` - Update round time limit
- `PATCH /api/rounds/:id/deactivate` - Deactivate a round
- `DELETE /api/rounds/:id` - Delete a round
- `GET /api/rounds/:roundId/participants` - Get participants for a specific round

### Question Management (Admin Only)
- `GET /api/questions/round/:roundId` - Get all questions for a round
- `POST /api/questions/round/:roundId` - Create a new question for a round
- `PUT /api/questions/:questionId` - Update a question
- `DELETE /api/questions/:questionId` - Delete a question

### Test & Submission
- `POST /api/test/login` - User login for test
- `POST /api/test/logout` - User logout
- `POST /api/test/` - Get active questions for the current round
- `POST /api/test/submit` - Submit answers for evaluation (mcq and tf auto evaluated before updating into db)

### Answer Validation (Admin Only)
- `GET /api/answer-validation/` - Get submissions that need validation
- `PUT /api/answer-validation/:submissionId` - Validate a submission
- `GET /api/answer-validation/stats` - Get validation statistics

### Results (Admin Only)
- `GET /api/results/round/:roundId` - Get all results for a specific round
- `GET /api/results/` - Get all results across all rounds
- `GET /api/results/user/:userId` - Get a user's results across all rounds

### Event Settings (Admin Only)
- `POST /api/eventsettings/set` - Set or update an event setting
- `GET /api/eventsettings/get` - Get a specific event setting
- `GET /api/eventsettings/all` - Get all event settings
- `DELETE /api/eventsettings/delete` - Delete an event setting

## Database

The application uses MongoDB with Mongoose ODM. The database connection is configured in `config/db.js`.

## Authentication

- JWT (JSON Web Tokens) are used for authentication
- Tokens should be included in the `Authorization` header as `Bearer <token>`
- Admin routes are protected by `adminAuthMiddleware`

## CORS Configuration

The backend is configured to accept requests from:
- Frontend URL (default: http://localhost:5173)
- Admin URL (default: http://localhost:5174)

## File Structure

```
backend/
├── config/
│   └── db.js           # Database connection
├── controllers/        # Route controllers
├── middleware/         # Custom middleware
├── models/             # Mongoose models
├── routes/             # Route definitions
├── uploads/            # File uploads directory
├── .env                # Environment variables
├── package.json
└── server.js           # Application entry point
```

## Deployment

1. Set up environment variables in your production environment
2. Install production dependencies:
   ```bash
   npm install --production
   ```
3. Start the server:
   ```bash
   node server.js
   ```
4. Build command:
      ```bash
   npm install
   ```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request


