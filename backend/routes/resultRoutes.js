import express from 'express';

const resultRoutes = express.Router();

//Get results of a round, in admin view
resultRoutes.get('/round/:roundId', (req, res) => {
  res.send('Result route is working');
});


export default resultRoutes;