import fs from 'fs';
import { TransactionRecord } from './types/types';
import { logFile } from '../config.json';

const logTransactonRecord = async (
    record: TransactionRecord
): Promise<void> => {
    const { date, orders, pl, type } = record;

    const ordersString = orders
        .map(({ ticker, volume }) => `${ticker}:${volume}`)
        .join('; ');

    const line = [date.toJSON(), type, pl.toString(), ordersString].join(', ');

    await fs.promises.appendFile(logFile, `${line}\n`);
};

export { logTransactonRecord };
