import express from 'express'

const questionRoutes = express.Router();

//Get questions of a round
questionRoutes.get('/round/:roundId', (req, res) => {
  res.send('Question route is working');
});

//Create question for a round
questionRoutes.post('/round/:roundId', (req, res) => {
  res.send('Question route is working');
});


//optional: Update question for a round
export default questionRoutes;