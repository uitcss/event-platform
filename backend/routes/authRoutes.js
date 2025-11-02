import express from 'express';
import { addUser, removeUser } from '../controllers/authController.js';


const authRoutes = express.Router();


<<<<<<< HEAD
//User registration (name, university, class, email, password, payment screenshot)
authRoutes.post('/register',registerUser);
=======
>>>>>>> a5442b9 (all backend and ui of admin panel has completed)

//Adding User (name, email)
authRoutes.post('/add',addUser);
authRoutes.delete('/remove',removeUser);


export default authRoutes;