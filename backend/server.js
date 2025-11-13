import express from 'express'
import userRoutes from './routes/userRoutes.js'
import roundRoutes from './routes/roundRoutes.js'
import authRoutes from './routes/authRoutes.js'
import questionRoutes from './routes/questionRoutes.js'
import adminAuthRoutes from './routes/adminAuthRoutes.js'
import resultRoutes from './routes/resultRoutes.js'
import { connectDB } from './config/db.js'
import eventSettingRoute from './routes/eventSettingRoute.js'
import cors from 'cors'
import dotenv from 'dotenv';
import adminAuthMiddleware from './middleware/adminAuthMiddleware.js';
import testRoutes from './routes/testRoutes.js'
import answerValidationRoutes from './routes/answerValidationRoutes.js'

dotenv.config();

const app = express()
const PORT = process.env.PORT || 4000

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use('/uploads', express.static('uploads'))

const allowedOrigins = [
  process.env.FRONTEND_URL || 'http://localhost:5173',
  process.env.ADMIN_URL || 'http://localhost:5174'
].filter(Boolean); // Remove any undefined values

console.log('Allowed CORS origins:', allowedOrigins);

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like curl requests OR POSTMAN)
      if (!origin) return callback(null, true);
      
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      
      console.warn(`Blocked request from origin: ${origin}`);
      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  })
);

try {
  connectDB()
  console.log('mongodb connected succesfully from server.js');
  
} catch (error) {
  
}

// Public routes (no auth required)

app.use('/api/test', testRoutes) // gets questions for active round and submits answers in frontend
app.use('/api/adminauth', adminAuthRoutes) // admin login routes


app.use(adminAuthMiddleware); 

app.use('/api/users', userRoutes) // admin only routes to get/promote/deactivate users
app.use('/api/rounds', roundRoutes) // admin only routes to create/activate/update rounds
app.use('/api/questions', questionRoutes) // admin only routes to add/update/delete questions
app.use('/api/results', resultRoutes) // admin only routes, gets results for users after grading is done
app.use('/api/eventsettings', eventSettingRoute) // set and get event settings
app.use('/api/auth', authRoutes) // add or remove users
app.use('/api/answer-validation', answerValidationRoutes) // validate and manage answer submissions

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})