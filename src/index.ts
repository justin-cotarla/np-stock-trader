import dotenv from 'dotenv';
import { getNP } from './neopetsApi';

dotenv.config();

const start = async (): Promise<void> => {
    const np = await getNP();
    console.log(np);
};

start();
