import express from 'express';
import { addUser, removeUser } from '../controllers/authController.js';


const authRoutes = express.Router();



//Adding User (name, email)
authRoutes.post('/add',addUser);
authRoutes.delete('/remove',removeUser);


export default authRoutes;