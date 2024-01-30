import express, { json } from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import userRoutes from './routes/user.route.js';
import errorMiddleware from './middleware/error.middleware.js';
import morgan from 'morgan';

// require('dotenv').config()

const app = express();


app.use(json());
app.use(cors({
    origin:[ process.env.CLIENT_URL],
    credentials: true
}))


app.use(morgan('dev'))
app.use(cookieParser());

app.use('/ping', (req, res) => {
    res.send('Pong');
})

app.use('/api/v1/user',userRoutes)

//if route does not match or not a valid route

app.all('*', (req,res) => {
    res.status(400).send('OOPS! 404 page not found');
})

app.use(errorMiddleware)
    
export default app;
