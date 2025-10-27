import express from 'express';
import { AdminLogin, getAdmins, SetAdmin, deleteAdmin } from '../controllers/adminController.js';

const adminAuthRoutes = express.Router();

// Admin management routes
adminAuthRoutes.get('/', getAdmins);
adminAuthRoutes.post('/login', AdminLogin);
adminAuthRoutes.post('/setadmin', SetAdmin);
adminAuthRoutes.delete('/:id', deleteAdmin);

export default adminAuthRoutes;