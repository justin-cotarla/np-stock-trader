import fs from 'fs';
import readline from 'readline';

import { SELL_COMMISSION } from './constants';
import { TransactionRecord } from './types/types';

const logTransactionRecord = async (
    record: TransactionRecord
): Promise<void> => {
    const { date, orders, pl, type } = record;

    const ordersString = orders
        .map(({ ticker, volume }) => `${ticker}:${volume}`)
        .join('; ');

    const line = [date.toJSON(), type, pl.toString(), ordersString].join(', ');

    await fs.promises.appendFile(global.options.logFile, `${line}\n`);
};

const logTrudysSurprise = async (np: number): Promise<void> => {
    const line = [new Date().toJSON(), 'TRUDY', np.toString()].join(', ');
    await fs.promises.appendFile(global.options.logFile, `${line}\n`);
};

const calculateProfit = async (buyPrice: number): Promise<number> => {
    const logStream = fs.createReadStream(global.options.logFile);
    const logReader = readline.createInterface({
        input: logStream,
    });

    let profit = 0;

    for await (const line of logReader) {
        const [, action, pl, tickers] = line.split(', ');

        if (action !== 'SELL') {
            continue;
        }

        const soldStockCount = tickers
            .split('; ')
            .reduce((acc, order) => acc + parseInt(order.split(':')[1]), 0);
        const stockPrice = soldStockCount * buyPrice;

        profit = profit - stockPrice + parseInt(pl) - SELL_COMMISSION;
    }

    logStream.close();
    return profit;
};

export { logTransactionRecord, logTrudysSurprise, calculateProfit };
