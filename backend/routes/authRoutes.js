import express from 'express';
import { loginUser, registerUser } from '../controllers/authController.js';

const authRoutes = express.Router();


//User registration (name, university, class, email, password, payment screenshot)
authRoutes.post('/register',registerUser);


//User login on contest day (email + password)
authRoutes.post('/login',loginUser);


export default authRoutes;