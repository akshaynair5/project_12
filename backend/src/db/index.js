import mongoose from "mongoose";
import {DB_NAME} from "../../constants.js"
import dotenv from 'dotenv'

dotenv.config({
    path: './env'
});

const dbConnect = async () =>{
    try{
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        console.log(`MongoDB connection has been established! HOST: ${connectionInstance.connection.host}`);
    }
    catch(err){
        console.log('Error connecting to MongoDB',err);
        process.exit(1);
    }
}

export default dbConnect;


