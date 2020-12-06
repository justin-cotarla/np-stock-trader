import dotenv from 'dotenv';
import {
    sellStock,
    getStockListings,
    buyStocks,
    getPortfolio,
    getBatches,
    getNP,
} from './neopetsApi';

dotenv.config();

const start = async (): Promise<void> => {
    // console.log(await getNP());
    // console.log(await getPortfolio());
    // console.log(await getBatches());
    // await sellStock([
    //     {
    //         ticker: 'CHPS',
    //         volume: 2,
    //     },
    //     {
    //         ticker: 'TPP',
    //         volume: 2,
    //     },
    // ]);
    // console.log(await getNP());
    // console.log(await getPortfolio());
    // console.log(await getBatches());
};

start();
