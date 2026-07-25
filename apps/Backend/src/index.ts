import "dotenv/config"
import express from "express";
import cors from "cors"

const app = express();

const PORT = process.env.PORT || 3000;

app.use(cors({
    origin : process.env.FRONTEND_URL!
}));

app.use();

app.listen(PORT, () => {
    console.log("Server listening on port", PORT);
});




console.log("Hello World");