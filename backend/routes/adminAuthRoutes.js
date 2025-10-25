import express from 'express';

const adminAuthRoutes = express.Router();

//Admin login (email + password)
adminAuthRoutes.post('/login', (req, res) => {
    res.send('Admin Auth route is working');
});

export default adminAuthRoutes;