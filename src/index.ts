import dotenv from 'dotenv';
import { program } from 'commander';
import { buyStrategy } from './strategy';
import { DefaultArgs } from './constants';
import {
    getBatches,
    getNP,
    getPortfolio,
    getStockListings,
} from './neopetsApi';

dotenv.config();

program
    .command('buy [volume] [price]')
    .description('execute buy strategy')
    .action(
        async (
            volume: string = DefaultArgs.BUY_VOLUME,
            price: string = DefaultArgs.BUY_PRICE
        ) => {
            try {
                const record = await buyStrategy({
                    price: parseInt(price),
                    volume: parseInt(volume),
                });
                console.log(record);
            } catch (err) {
                console.log(err);
            }
        }
    );

program
    .command('balance')
    .description('display np balance')
    .action(async () => {
        const balance = await getNP();
        console.log(`Balance: ${balance} NP`);
    });

program
    .command('portfolio')
    .description('display portfolio')
    .action(async () => {
        const portfolio = await getPortfolio();
        console.log(JSON.stringify(portfolio, null, 2));
    });

program
    .command('batches')
    .description('display portfolio batches')
    .action(async () => {
        const batches = await getBatches();
        console.log(JSON.stringify(batches, null, 2));
    });

program
    .command('listings')
    .description('display stock listings')
    .action(async () => {
        const listings = await getStockListings();
        console.log(JSON.stringify(listings, null, 2));
    });

program.parseAsync(process.argv);
