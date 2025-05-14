import dbConnect from './src/db/index.js';
import { app } from './app.js';
import dotenv from 'dotenv';
dotenv.config({
    path: './.env'
});


dbConnect()
    .then(()=>{
        app.listen(process.env.PORT || 5000, ()=>{
            console.log(`Server has started successfully at PORT:${process.env.PORT || 5000}`)
        })
    })
    .catch((err)=>{
        console.log('MongoDB connection error:',err)
    })