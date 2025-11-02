import { Router } from "express";
import { getActiveQuestions,loginUser,submitAnswers } from "../controllers/testController.js";

const testRoutes = Router();

//validate email
testRoutes.post('/login', loginUser);

// get active questions
testRoutes.get('/',getActiveQuestions);

//submit answers and autograde mcq and truefalse
// ***{for frontendTeam: you get userId when login and roundId from active round api, save these in the web and send them while submitting answers api. and after successful submission remove these from web storage. do not forget to remove these else it will cause security issues}***
testRoutes.post('/submit',submitAnswers);
export default testRoutes;