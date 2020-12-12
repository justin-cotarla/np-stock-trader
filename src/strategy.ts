import fs from 'fs';
import readline from 'readline';

import { logTransactionRecord } from './logger';
import {
    buyStocks,
    getNP,
    getPortfolio,
    getStockListings,
    sellStock,
} from './neopetsApi';
import { getSellRatio } from './sellRatio';
import {
    BuyStrategy,
    Order,
    SellStrategy,
    TransactionRecord,
} from './types/types';

const SELL_COMMISSION = 20;

const executeBuyStrategy = async (
    strategy: BuyStrategy
): Promise<TransactionRecord> => {
    const { price: buyPrice, volume: strategyVolume } = strategy;

    const stockListings = await getStockListings();
    const np = await getNP();

    const projectedNp = np - buyPrice * strategyVolume;

    const buyVolume =
        projectedNp < SELL_COMMISSION
            ? Math.floor(np - SELL_COMMISSION / buyPrice)
            : strategyVolume;

    const viableStocks = stockListings.filter(
        ({ price, volume }) => price === buyPrice && volume !== 0
    );

    if (viableStocks.length === 0) {
        throw Error('Nothing to trade');
    }

    let buyOrders: Order[] = [];

    let remainingVolume = buyVolume;
    let targetStockVolume = Math.floor(buyVolume / viableStocks.length);

    for (let i = 0; i < viableStocks.length; i += 1) {
        const { volume: availableVolume, ticker } = viableStocks[i];

        let stockVolume = 0;
        if (targetStockVolume > availableVolume) {
            stockVolume = availableVolume;
            remainingVolume -= stockVolume;
            targetStockVolume = Math.floor(
                remainingVolume / viableStocks.length - i
            );
        } else {
            stockVolume = targetStockVolume;
            remainingVolume -= stockVolume;
        }

        buyOrders = [
            ...buyOrders,
            {
                ticker,
                volume: stockVolume,
            },
        ];
    }

    if (buyOrders.length === 0) {
        throw new Error('Nothing was bought');
    }

    const executedOrders = await buyStocks(buyOrders);
    const fulfilledOrders = executedOrders.filter(
        (order) => order !== null
    ) as Order[];

    if (fulfilledOrders.length === 0) {
        throw new Error('Order not fulfilled');
    }

    const pl = fulfilledOrders.reduce((acc, { ticker, volume }) => {
        const stockCost =
            (stockListings.find(
                ({ ticker: listingTicker }) => listingTicker === ticker
            )?.price ?? 0) * volume;
        return acc - stockCost;
    }, 0);

    const transactionRecord: TransactionRecord = {
        date: new Date(),
        type: 'BUY',
        orders: fulfilledOrders,
        pl,
    };

    logTransactionRecord(transactionRecord);

    return transactionRecord;
};

const executeSellStrategy = async (
    strategy: SellStrategy
): Promise<TransactionRecord> => {
    const { minPrice } = strategy;

    const stockListings = await getStockListings();
    const portfolio = await getPortfolio();

    const availableTickers = Object.keys(portfolio);
    const viableStocks = stockListings.filter(
        ({ ticker, price }) =>
            availableTickers.includes(ticker) && price >= minPrice
    );

    const sellOrders: Order[] = viableStocks
        .map(({ price, ticker }) => {
            const sellRatio = getSellRatio(price);
            const sellVolume = Math.floor(sellRatio * portfolio[ticker]);
            return { ticker, volume: sellVolume };
        })
        .filter(({ volume }) => volume !== 0);

    if (sellOrders.length === 0) {
        throw new Error('Nothing was sold');
    }

    const potentialSellPrice = sellOrders.reduce(
        (acc, { ticker, volume }) =>
            acc +
            (stockListings.find(
                ({ ticker: listingTicker }) => listingTicker === ticker
            )?.price ?? 0) *
                volume,
        0
    );

    if (potentialSellPrice <= SELL_COMMISSION) {
        throw new Error('Stock not sold: no gain');
    }

    const fulfilledOrders = await sellStock(sellOrders);

    if (fulfilledOrders.length === 0) {
        throw new Error('Order not fulfilled');
    }

    const pl = fulfilledOrders.reduce((acc, { ticker, volume }) => {
        const stockCost =
            (stockListings.find(
                ({ ticker: listingTicker }) => listingTicker === ticker
            )?.price ?? 0) * volume;
        return acc + stockCost;
    }, 0);

    const transactionRecord: TransactionRecord = {
        date: new Date(),
        type: 'SELL',
        orders: fulfilledOrders,
        pl,
    };

    logTransactionRecord(transactionRecord);

    return transactionRecord;
};

const calculateProfit = async (buyPrice: number): Promise<number> => {
    const logStream = fs.createReadStream(global.options.logFile);
    const logReader = readline.createInterface({
        input: logStream,
    });

    let profit = 0;

    for await (const line of logReader) {
        const [, action, pl, tickers] = line.split(', ');

        if (action === 'BUY') {
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

export { executeBuyStrategy, executeSellStrategy, calculateProfit };
