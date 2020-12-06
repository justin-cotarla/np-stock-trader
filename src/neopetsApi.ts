import { executeRequest, requestPage } from './networkController';
import { Portfolio, StockListing } from './types/types';

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
    const np = parseInt(regex.exec(indexPage)![1].replace(',', ''), 10);

    return np;
};

const getStockListings = async (): Promise<StockListing[]> => {
    const regex = /company_id=[\d]+'><b>([A-Z]+)<\/b><\/a><\/td><td bgcolor='#eeeeff'>[\w\. ]+<\/td><td bgcolor='#[a-f]{6}' align=center>([\d]*)<\/td><td bgcolor='#[a-f]{6}' align=center><b>[\d]*<\/b><\/td><td bgcolor='#[a-f]{6}' align=center><b>([\d]*)<\/b><\/td><td bgcolor/g;
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
                    volume: parseInt(currentListing[2], 10),
                    price: parseInt(currentListing[3], 10),
                },
            ];
        }
        currentListing = regex.exec(listingsPage);
    }
    return listings;
};

const buyStocks = async (ticker: string, quantity: number): Promise<void> => {
    const refTokenRegex = /<input type='hidden' name='_ref_ck' value='([a-f\d]+)'>/;

    const buyPage = await requestPage('/stockmarket.phtml?type=buy');

    const refTokenMatch = refTokenRegex.exec(buyPage);
    if (!refTokenMatch || !refTokenMatch[1]) {
        throw new Error('Could not get _ref_ck');
    }
    const refToken = refTokenMatch[1];

    const data = {
        _ref_ck: refToken,
        type: 'buy',
        ticker_symbol: ticker,
        amount_shares: quantity.toString(),
    };

    await executeRequest('/process_stockmarket.phtml', data);
};

const getPortfolio = async (): Promise<Portfolio> => {
    const tickerRegex = /<td align="center"><a href="stockmarket\.phtml\?type=buy&ticker=([A-Z]+)/g;
    const quantityRegex = /<\/b><\/font>\n\t{4}<\/td>\n\t{4}<td align="center">\n([\d]+)\t{4}<\/td>/g;

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
            const volume = parseInt(currentQuantity[1], 10);
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

export { getNP, getStockListings, buyStocks, getPortfolio };
