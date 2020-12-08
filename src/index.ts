import dotenv from 'dotenv';
import { createCommand } from 'commander';
import { executeBuyStrategy, executeSellStrategy } from './strategy';
import { DefaultArgs, DEFAULT_CLI_OPTIONS } from './constants';
import {
    getBatches,
    getNP,
    getPortfolio,
    getStockListings,
} from './neopetsApi';
import { CliOptions } from './types/types';

const setConfig = ({
    username,
    password,
    logFile,
    authEnv,
}: CliOptions): void => {
    global.options = {
        ...DEFAULT_CLI_OPTIONS,
        ...(logFile ? { logFile } : {}),
        ...(authEnv ? { authEnv } : {}),
    };

    if (global.options.authEnv) {
        dotenv.config();
        global.options = {
            ...global.options,
            username: process.env.NP_USERNAME as string,
            password: process.env.NP_PASSWORD as string,
        };
    } else {
        global.options = {
            ...global.options,
            username,
            password,
        };
    }
};

const program = createCommand();

const cliOptions = program
    .option('-u, --username <username>', 'Neopets username')
    .option('-p, --password <password>', 'Neopets password')
    .option('-l, --log-file <file>', 'log file location')
    .option('-e, --auth-env', 'load crendentials from env');

cliOptions
    .command('buy [volume] [price]')
    .description('execute buy strategy')
    .action(
        async (
            volume: string = DefaultArgs.BUY_VOLUME,
            price: string = DefaultArgs.BUY_PRICE,
            cmdObj
        ) => {
            setConfig(cmdObj.parent);

            const record = await executeBuyStrategy({
                price: parseInt(price),
                volume: parseInt(volume),
            });
            console.log(record);
        }
    );

cliOptions
    .command('sell [min-price]')
    .description('execute sell strategy')
    .action(async (minPrice: string = DefaultArgs.MIN_PRICE, cmdObj) => {
        setConfig(cmdObj.parent);

        const record = await executeSellStrategy({
            minPrice: parseInt(minPrice),
        });
        console.log(record);
    });

cliOptions
    .command('balance')
    .description('display np balance')
    .action(async (cmdObj) => {
        setConfig(cmdObj.parent);
        const balance = await getNP();
        console.log(`Balance: ${balance} NP`);
    });

cliOptions
    .command('portfolio')
    .description('display portfolio')
    .action(async (cmdObj) => {
        setConfig(cmdObj.parent);
        const portfolio = await getPortfolio();
        console.log(JSON.stringify(portfolio, null, 2));
    });

cliOptions
    .command('batches')
    .description('display portfolio batches')
    .action(async (cmdObj) => {
        setConfig(cmdObj.parent);
        const batches = await getBatches();
        console.log(JSON.stringify(batches, null, 2));
    });

cliOptions
    .command('listings')
    .description('display stock listings')
    .action(async (cmdObj) => {
        setConfig(cmdObj.parent);
        const listings = await getStockListings();
        console.log(JSON.stringify(listings, null, 2));
    });

const run = async (): Promise<void> => {
    try {
        await program.parseAsync(process.argv);
    } catch (err) {
        console.log(err.message);
    }
};

run();
