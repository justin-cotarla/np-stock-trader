declare global {
    namespace NodeJS {
        interface Global {
            document: Document;
            window: Window;
            navigator: Navigator;
            options: CliOptions;
        }
    }
}

export interface StockListing {
    ticker: string;
    volume: number;
    price: number;
}

export interface Batch {
    ticker: string;
    volume: number;
    instruction: string;
}

export interface Order {
    ticker: string;
    volume: number;
}

export interface NpSellOrder {
    instruction: string;
    volume: number;
}

export interface Portfolio {
    [ticker: string]: number;
}

export interface TransactionRecord {
    type: 'BUY' | 'SELL';
    date: Date;
    pl: number;
    orders: Order[];
}

export interface BuyStrategy {
    price: number;
    volume: number;
}

export interface SellStrategy {
    minPrice: number;
}

export interface CliOptions {
    username: string;
    password: string;
    logFile: string;
    authEnv: boolean;
}
