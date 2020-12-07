import { logTransactonRecord } from './logger';
import { buyStocks, getNP, getStockListings } from './neopetsApi';
import { BuyStrategy, Order } from './types/types';

const MIN_FUNDS = 20;

const DEFAULT_BUY_STRATEGY: BuyStrategy = {
    price: 15,
    volume: 1000,
};

const executeBuyStrategy = async (
    strategy: BuyStrategy = DEFAULT_BUY_STRATEGY
): Promise<void> => {
    const { price: buyPrice, volume: strategyVolume } = strategy;

    const stockListings = await getStockListings();
    const np = await getNP();

    const projectedNp = np - buyPrice * strategyVolume;

    const buyVolume =
        projectedNp < MIN_FUNDS
            ? Math.floor(np - MIN_FUNDS / buyPrice)
            : strategyVolume;

    const viableStocks = stockListings.filter(
        ({ price, volume }) => price === buyPrice && volume !== 0
    );

    if (viableStocks.length === 0) {
        return;
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

    const executedOrders = await buyStocks(buyOrders);
    const fulfilledOrders = executedOrders.filter(
        (order) => order !== null
    ) as Order[];

    if (fulfilledOrders.length === 0) {
        return;
    }

    const pl = fulfilledOrders.reduce(
        (acc, { ticker, volume }) =>
            acc -
            stockListings.find(
                ({ ticker: listingTicker }) => listingTicker === ticker
            )!.price *
                volume,
        0
    );

    logTransactonRecord({
        date: new Date(),
        type: 'BUY',
        orders: fulfilledOrders,
        pl,
    });
};

export { executeBuyStrategy as buyStrategy };
