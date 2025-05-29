import dbConnect from './src/db/index.js';
import { app } from './app.js';
import dotenv from 'dotenv';
import { connectRedis } from './src/config/redis.config.js';

dotenv.config({ path: './.env' });

const startServer = async () => {
    try {
        await dbConnect();
        await connectRedis();

        app.listen(process.env.PORT || 5000, () => {
            console.log(`Server started at PORT: ${process.env.PORT || 5000}`);
        });
    } catch (err) {
        console.error('Server startup error:', err);
    }
};

startServer();
