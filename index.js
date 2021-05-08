const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const cors = require('cors');
const redis = require('redis');
let RedisStore = require('connect-redis')(session);

const {
    MONGO_IP,
    MONGO_USER,
    MONGO_PASSWORD,
    MONGO_PORT,
    REDIS_URL,
    REDIS_PORT,
    SESSION_SECRET
} = require('./config/config');

let redisClient = redis.createClient({
    host: REDIS_URL,
    port: REDIS_PORT,
})

const app = express();

const postRouter = require('./routes/postRoutes');
const userRouter = require('./routes/userRoutes');

const mongoURL = `mongodb://${MONGO_USER}:${MONGO_PASSWORD}@${MONGO_IP}:${MONGO_PORT}/?authSource=admin`;

const connectWithRetry = () => {
    mongoose
        .connect(mongoURL, {
            useNewUrlParser:true,
            useUnifiedTopology: true,
            useFindAndModify: true,
        })
        .then(()=>console.log("Successfully Connected to db"))
        .catch((e)=> {
            console.log(e);
            setTimeout(connectWithRetry, 5000);
        });
}

connectWithRetry();
app.enable('trust proxy');
app.use(cors({}));
app.use(session({
    store: new RedisStore({client: redisClient}),
    secret: SESSION_SECRET,
    cookie: {
        secure: false,
        resave: false,
        saveUninitialized: false,
        httpOnly: true,
        maxAge: 60000,
    }
}))
app.use(express.json());

app.get('/api/v1', (req, res)=>{
    res.send("<h2>Hello from Express!!!</h2>");
    console.log("I was Called!!");
})

app.use("/api/v1/posts", postRouter);
app.use("/api/v1/users", userRouter);

const port = process.env.PORT || 3000;

app.listen(port, ()=> console.log(`Listening on port ${port}`));