import express from 'express'


const app = express()
const PORT = process.env.PORT || 4000

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use('/uploads', express.static('uploads'))


//api routes
import userRoutes from './routes/userRoutes.js'
import roundRoutes from './routes/roundRoutes.js'
import authRoutes from './routes/authRoutes.js'
import questionRoutes from './routes/questionRoutes.js'
import adminAuthRoutes from './routes/adminAuthRoutes.js'
import gradingRoutes from './routes/gradingRoutes.js'
import resultRoutes from './routes/resultRoutes.js'

app.use('/api/users', userRoutes)
app.use('/api/rounds', roundRoutes)
app.use('/api/auth', authRoutes)
app.use('/api/questions',questionRoutes)
app.use('/api/adminAuth', adminAuthRoutes)
app.use('/api/grading',gradingRoutes)
app.use('/api/results',resultRoutes)


app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})