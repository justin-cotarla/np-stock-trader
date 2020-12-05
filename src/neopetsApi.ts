import { requestPage } from './networkController';

const getNP = async (): Promise<number> => {
    const regex = /<a id='npanchor' href="\/inventory.phtml">([\d,]*)<\/a>/;

    const indexPage = await requestPage('/index.phtml');
    const np = parseInt(regex.exec(indexPage)![1].replace(',', ''), 10);

    return np;
};

export { getNP };
