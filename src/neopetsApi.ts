import { requestPage } from './networkController';
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
        currentListing = regex.exec(listingsPage);

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
    }
    return listings;
};

export { getNP, getStockListings };
