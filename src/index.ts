import dotenv from 'dotenv';
import { getPortfolio, getNP } from './neopetsApi';
import { buyStrategy } from './strategy';

dotenv.config();

const start = async (): Promise<void> => {
    console.log(await getNP());
    console.log(await getPortfolio());
    await buyStrategy();
    console.log(await getNP());
    console.log(await getPortfolio());
};

start();
