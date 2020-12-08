import fs from 'fs';
import { DEFAULT_LOG_FILE } from './constants';
import { TransactionRecord } from './types/types';

const logTransactonRecord = async (
    record: TransactionRecord
): Promise<void> => {
    const { date, orders, pl, type } = record;

    const ordersString = orders
        .map(({ ticker, volume }) => `${ticker}:${volume}`)
        .join('; ');

    const line = [date.toJSON(), type, pl.toString(), ordersString].join(', ');

    await fs.promises.appendFile(
        process.env.LOG_FILE || DEFAULT_LOG_FILE,
        `${line}\n`
    );
};

export { logTransactonRecord };
