import express, { urlencoded } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";


const app = express()

app.use(express.json({limit:'16kb'}))
app.use(urlencoded({limit:'16kb',extended:true}))
app.use(cookieParser())                    
app.use(express.static('public'))
app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))

import authRouter from './routes/auth.routes.js'
import userRouter from './routes/user.routes.js'

app.use('/api/v1/auth', authRouter)
app.use('/api/v1/user', userRouter)