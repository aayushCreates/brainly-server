import express, { urlencoded } from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';

const app = express();
dotenv.config();

app.use(cookieParser());
app.use(express.json());



const port = process.env.PORT || 5000;
app.listen(port, ()=> {
    console.log("server is running on the port " + port + "🚀")
})




