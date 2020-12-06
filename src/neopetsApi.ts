import { URLSearchParams } from 'url';
import { executeRequest, requestPage } from './networkController';
import { StockListing } from './types/types';

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
        if (
            currentListing !== null &&
            currentListing[1] &&
            currentListing[2] &&
            currentListing[3]
        ) {
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

    console.log(data);

    await executeRequest('/process_stockmarket.phtml', data);
};

export { getNP, getStockListings, buyStocks };
