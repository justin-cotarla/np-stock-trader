import dotenv from 'dotenv';
import { getStockListings } from './neopetsApi';

dotenv.config();

const start = async (): Promise<void> => {
    const listings = await getStockListings();
    console.log(listings);
};

start();
