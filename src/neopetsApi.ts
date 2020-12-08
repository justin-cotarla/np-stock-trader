import R from 'ramda';

import { executeRequest, requestPage } from './networkController';
import {
    Batch,
    NpSellOrder,
    Order,
    Portfolio,
    StockListing,
} from './types/types';

const validateRegexResult = (
    regexResult: RegExpExecArray,
    expectedGroups: number
): boolean => {
    for (let i = 0; i < expectedGroups; i += 1) {
        if (regexResult[1 + i] === undefined || regexResult[1 + i] === null) {
            return false;
        }
    }
    return true;
};

const getNP = async (): Promise<number> => {
    const regex = /<a id='npanchor' href="\/inventory.phtml">([\d,]*)<\/a>/;

    const indexPage = await requestPage('/index.phtml');
    const np = parseInt(regex.exec(indexPage)![1].replace(',', ''));

    return np;
};

const getRefToken = (page: string): string => {
    const refTokenRegex = /<input type='hidden' name='_ref_ck' value='([a-f\d]+)'>/;

    const refTokenMatch = refTokenRegex.exec(page);
    if (!refTokenMatch || !refTokenMatch[1]) {
        throw new Error('Could not get _ref_ck');
    }
    return refTokenMatch[1];
};

const getStockListings = async (): Promise<StockListing[]> => {
    const regex = /company_id=[\d]+'><b>([A-Z]+)<\/b><\/a><\/td><td bgcolor='#eeeeff'>[\w. ]+<\/td><td bgcolor='#[a-f]{6}' align=center>([\d]*)<\/td><td bgcolor='#[a-f]{6}' align=center><b>[\d]*<\/b><\/td><td bgcolor='#[a-f]{6}' align=center><b>([\d]*)<\/b><\/td><td bgcolor/g;
    const listingsPage = await requestPage(
        '/stockmarket.phtml?type=list&full=true'
    );

    let listings: StockListing[] = [];

    let currentListing = regex.exec(listingsPage);
    while (currentListing !== null) {
        if (currentListing !== null && validateRegexResult(currentListing, 3)) {
            listings = [
                ...listings,
                {
                    ticker: currentListing[1],
                    volume: parseInt(currentListing[2]),
                    price: parseInt(currentListing[3]),
                },
            ];
        }
        currentListing = regex.exec(listingsPage);
    }
    return listings.sort(
        ({ price: firstPrice }, { price: secondPrice }) =>
            firstPrice - secondPrice
    );
};

const buyStocks = async (orders: Order[]): Promise<(Order | null)[]> => {
    const buyPage = await requestPage('/stockmarket.phtml?type=buy');

    const refToken = getRefToken(buyPage);

    const orderPromises = orders.map(
        async (order): Promise<Order | null> => {
            const { ticker, volume } = order;
            const data = {
                _ref_ck: refToken,
                type: 'buy',
                ticker_symbol: ticker,
                amount_shares: volume.toString(),
            };
            try {
                await executeRequest('/process_stockmarket.phtml', data);
            } catch (error) {
                return null;
            }
            return order;
        }
    );

    const fulfilledOrders = await Promise.all(orderPromises);
    return fulfilledOrders;
};

const getPortfolio = async (): Promise<Portfolio> => {
    const tickerRegex = /<td align="center"><a href="stockmarket\.phtml\?type=buy&ticker=([A-Z]+)/g;
    const quantityRegex = /<\/b><\/font>\n\t{4}<\/td>\n\t{4}<td align="center">\n([\d,]+)\t{4}<\/td>/g;

    const portfolioPage = await requestPage(
        '/stockmarket.phtml?type=portfolio'
    );

    let portfolio: Portfolio = {};

    let currentTicker = tickerRegex.exec(portfolioPage);
    let currentQuantity = quantityRegex.exec(portfolioPage);

    while (currentTicker !== null) {
        if (
            currentTicker !== null &&
            validateRegexResult(currentTicker, 1) &&
            currentQuantity !== null &&
            validateRegexResult(currentQuantity, 1)
        ) {
            const ticker = currentTicker[1];
            const volume = parseInt(currentQuantity[1].replace(',', ''));
            portfolio = {
                ...portfolio,
                [ticker]: volume,
            };
        }
        currentTicker = tickerRegex.exec(portfolioPage);
        currentQuantity = quantityRegex.exec(portfolioPage);
    }
    return portfolio;
};

const getBatches = async (): Promise<Batch[]> => {
    const volumeRegex = /<tr>\n\t{7}<td align="center">([\d,]+)<\/td>/g;
    const instructionRegex = /sell\[([A-Z]+)\]\[\d+\]/g;

    const portfolioPage = await requestPage(
        '/stockmarket.phtml?type=portfolio'
    );

    let availableBatches: Batch[] = [];

    let currentVolume = volumeRegex.exec(portfolioPage);
    let currentInstruction = instructionRegex.exec(portfolioPage);

    while (currentVolume !== null) {
        if (
            currentVolume !== null &&
            validateRegexResult(currentVolume, 1) &&
            currentInstruction !== null &&
            validateRegexResult(currentInstruction, 1)
        ) {
            const orderVolume = parseInt(currentVolume[1].replace(',', ''));
            const orderTicker = currentInstruction[1];
            const orderInstruction = currentInstruction[0];

            availableBatches = [
                ...availableBatches,
                {
                    instruction: orderInstruction,
                    ticker: orderTicker,
                    volume: orderVolume,
                },
            ];
        }
        currentVolume = volumeRegex.exec(portfolioPage);
        currentInstruction = instructionRegex.exec(portfolioPage);
    }

    return availableBatches;
};

const sellStock = async (orders: Order[]): Promise<void> => {
    const portfolioPage = await requestPage(
        '/stockmarket.phtml?type=portfolio'
    );

    const refToken = getRefToken(portfolioPage);
    const availableBatches = await getBatches();

    const orderTickers = orders.map(({ ticker }) => ticker);
    const filteredBatches = availableBatches.filter(({ ticker }) =>
        orderTickers.includes(ticker)
    );
    const groupedBatches = R.groupBy<Batch>(
        ({ ticker }) => ticker,
        filteredBatches
    );

    let sellOrders: NpSellOrder[] = [];

    Object.entries(groupedBatches).forEach(([ticker, batches]) => {
        const { volume } = orders?.find(
            ({ ticker: orderTicker }) => orderTicker === ticker
        ) ?? { undefined };

        if (volume === undefined) {
            throw new Error('Order ticker not in available batches');
        }

        const sortedBatches = batches.sort(
            ({ volume: firstVolume }, { volume: secondVolume }) =>
                firstVolume - secondVolume
        );

        let remainingVolume = volume;

        for (let i = 0; i < sortedBatches.length; i += 1) {
            const {
                instruction: batchInstruction,
                volume: batchVolume,
            } = sortedBatches[i];

            const sellVolume =
                remainingVolume > batchVolume ? batchVolume : remainingVolume;
            remainingVolume -= sellVolume;

            sellOrders = [
                ...sellOrders,
                {
                    instruction: batchInstruction,
                    volume: sellVolume,
                },
            ];

            if (remainingVolume === 0) {
                break;
            }
        }
    });

    const data = {
        _ref_ck: refToken,
        type: 'sell',
        ...sellOrders.reduce(
            (acc, { instruction, volume }) => ({
                ...acc,
                [instruction]: volume,
            }),
            {}
        ),
    };

    await executeRequest('/process_stockmarket.phtml', data);
};

export {
    getNP,
    getStockListings,
    buyStocks,
    getPortfolio,
    sellStock,
    getBatches,
};
