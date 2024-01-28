const express=require('express')
const cookieParser=require('cookie-parser')
const cors = require('cors')
const userRoutes = require('./routes/user.routes');
const errorMiddleware = require('./middleware/error.middleware');

// require('dotenv').config()

const app = express();


app.use(express.json());
app.use(cors({
    origin:[ process.env.CLIENT_URL],
    credentials: true
}))

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
    
module.exports=app
