import express from 'express';
import {AdminLogin,SetAdmin} from '../controllers/adminController.js';

const adminAuthRoutes = express.Router();

//Admin login (email + password)
adminAuthRoutes.post('/login', AdminLogin);
adminAuthRoutes.post('/setadmin',SetAdmin)


export default adminAuthRoutes;