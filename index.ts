import dotenv from 'dotenv';
import { buyStrategy } from './src/strategy';

dotenv.config();

const start = async (): Promise<void> => {
    await buyStrategy();
};

start();
