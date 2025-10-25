import express from 'express';

const roundRoutes = express.Router();

//Get all rounds and status
roundRoutes.get('/', (req, res) => {
  res.send('Round route is working');
});

//Create new round
roundRoutes.post('/', (req, res) => {
  res.send('Round route is working');
})

// Activate this round → sets is_active=true, other rounds = false
roundRoutes.patch('/:id/activate',(req, res) => {
  res.send('Round route is working');
} );

// Update time limit of a round
roundRoutes.patch('/:id/time',(req, res) => {
    res.send('Round route is working'); 
} );

export default roundRoutes;