import "dotenv/config"
import express from "express";
import cors from "cors"
import analyzeRouter from "./routes/analyze.route";

const app = express();

const PORT = process.env.PORT || 3000;

app.use(cors({
    origin : process.env.FRONTEND_URL!
}));

app.use("api/v1", analyzeRouter);

app.listen(PORT, () => {
    console.log("Server listening on port", PORT);
});




console.log("Hello World");