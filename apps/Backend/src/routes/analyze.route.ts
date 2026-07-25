
import { Router } from "express";
import { analyze } from "../controllers/analyze.controller";


const analyzeRouter : Router = Router();

analyzeRouter.get('/analyze', analyze);

export default analyzeRouter;