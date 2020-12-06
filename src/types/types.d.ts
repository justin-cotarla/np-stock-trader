export interface StockListing {
    ticker: string;
    volume: number;
    price: number;
}

export interface Portfolio {
    [ticker: string]: number;
}
