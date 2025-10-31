import express from 'express'
import userRoutes from './routes/userRoutes.js'
import roundRoutes from './routes/roundRoutes.js'
import authRoutes from './routes/authRoutes.js'
import questionRoutes from './routes/questionRoutes.js'
import adminAuthRoutes from './routes/adminAuthRoutes.js'
import gradingRoutes from './routes/gradingRoutes.js'
import resultRoutes from './routes/resultRoutes.js'
import { connectDB } from './config/db.js'
import quizRoutes from './routes/quizRoutes.js'
import eventSettingRoute from './routes/eventSettingRoute.js'
import cors from 'cors'
import dotenv from 'dotenv';
import adminAuthMiddleware from './middleware/adminAuthMiddleware.js';

dotenv.config();

const app = express()
const PORT = process.env.PORT || 4000

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use('/uploads', express.static('uploads'))
app.use(cors())

try {
  connectDB()
  console.log('mongodb connected succesfully from server.js');
  
} catch (error) {
  
}

// Public routes (no auth required)
app.use('/api/auth', authRoutes) // register and login routes for frontend
app.use('/api/quiz', quizRoutes) // gets questions for active round and submits answers in frontend
app.use('/api/adminauth', adminAuthRoutes) // admin login routes


app.use(adminAuthMiddleware); 

app.use('/api/users', userRoutes) // admin only routes to get/promote/deactivate users
app.use('/api/rounds', roundRoutes) // admin only routes to create/activate/update rounds
app.use('/api/questions', questionRoutes) // admin only routes to add/update/delete questions
app.use('/api/grading', gradingRoutes) // admin only routes to get submissions and mark marks
app.use('/api/results', resultRoutes) // admin only routes, gets results for users after grading is done
app.use('/api/eventsettings', eventSettingRoute) // set and get event settings

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})