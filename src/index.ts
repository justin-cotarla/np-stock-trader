import dotenv from 'dotenv';
import { buyStocks, getNP, getPortfolio } from './neopetsApi';

dotenv.config();

const start = async (): Promise<void> => {
    console.log(await getNP());
    await buyStocks('KBAT', 1);
    console.log(await getNP());

    console.log(await getPortfolio());
};

start();
