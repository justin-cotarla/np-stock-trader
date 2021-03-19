import { CliOptions } from './types/types';

export const SELL_COMMISSION = 20;

export const enum DefaultArgs {
    BUY_PRICE = '15',
    BUY_VOLUME = '1000',
    MIN_PRICE = '60',
}

export const DEFAULT_CLI_OPTIONS: CliOptions = {
    username: '',
    password: '',
    logFile: 'transactions.csv',
    authEnv: false,
};
