import express from 'express';
import { use } from 'react';

const userRoutes = express.Router();

//get all users
userRoutes.get('/', (req, res) => {
  res.send('User route is working');
});


//Approve payment → sets payment_status = 'Approved', is_active = true, current_round = 1
userRoutes.patch('/:id/approve',(req, res) => {
  res.send('User route is working');
});


//Promote user to next round → increments current_round
userRoutes.patch('/:id/promote',(req, res) => {
  res.send('User route is working');
});

//Deactivate user → sets is_active = false
userRoutes.patch('/:id/deactivate',(req, res) => {
  res.send('User route is working');
} );

//Get single user by ID
userRoutes.get('/:id',(req, res) => {
  res.send('User route is working');
});


userRoutes.get('/round/:roundId',(req, res) => {
  res.send('User route is working');
});

export default userRoutes;