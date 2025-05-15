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

import authRouter from './src/routes/auth.routes.js'
import userRouter from './src//routes/user.routes.js'
import connectionRouter from './src/routes/connection.routes.js'
import membershipRouter from './src/routes/membership.routes.js'
import groupRouter from './src/routes/group.routes.js'
import messageRouter from './src/routes/message.routes.js'

app.use('/api/v1/auth', authRouter)
app.use('/api/v1/user', userRouter)
app.use('/api/v1/connections', connectionRouter)
app.use('/api/v1/memberships', membershipRouter)
app.use('/api/v1/groups', groupRouter)
app.use('/api/v1/messages', messageRouter)


export { app }