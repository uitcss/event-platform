import express from 'express';

const authRoutes = express.Router();


//User registration (name, university, class, email, password, payment screenshot)
authRoutes.post('/register', (req, res) => {
    res.send('Auth route is working');
});


//User login on contest day (email + password)
authRoutes.post('/login', (req, res) => {
    res.send('Auth route is working');
});


export default authRoutes;