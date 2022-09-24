import { URLSearchParams } from 'url';

import Axios, { AxiosResponse } from 'axios';

import { getContext } from './context';

let cookieString: string | null = null;

const NEOPETS_BASE_URL = 'https://www.neopets.com';

const baseHeaders = {
    accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
    'Accept-Encoding': 'gzip, deflate, br',
    'Accept-Language': 'en-US,en;q=0.9',
    'Cache-Control': 'max-age=0',
    Connection: 'keep-alive',
    'Content-Type': 'application/x-www-form-urlencoded',
    Host: 'www.neopets.com',
    Origin: 'https://www.neopets.com',
    'Upgrade-Insecure-Requests': '1',
    'User-Agent':
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/105.0.0.0 Safari/537.36',
};

const getCookie = async (): Promise<string> => {
    if (cookieString === null) {
        cookieString = await authenticate(
            getContext().options.username,
            getContext().options.password
        );
    }
    return cookieString;
};

const getPageCookies = async (pageRequest: Promise<AxiosResponse<unknown>>) => {
    const res = await pageRequest;
    const cookies: string[] = res.headers['set-cookie'].map(
        (cookie: string) => cookie.split('; ')[0]
    );

    return cookies.join('; ');
};

const authenticate = async (
    username: string,
    password: string
): Promise<string> => {
    const loginForm = new URLSearchParams({
        destination: '',
        return_format: 'json',
        username,
        password,
    });

    try {
        const baseCookies = await getPageCookies(
            Axios.get(`${NEOPETS_BASE_URL}/login/`, {
                headers: baseHeaders,
            })
        );

        const authCookies = await getPageCookies(
            Axios.post(`${NEOPETS_BASE_URL}/login.phtml`, loginForm, {
                validateStatus: (status) => status === 200,
                maxRedirects: 0,
                headers: {
                    ...baseHeaders,
                    cookie: baseCookies,
                    'Content-Length': loginForm.toString().length.toString(),
                },
            })
        );

        return [baseCookies, authCookies].join('; ');
    } catch (err) {
        console.error(err);
        throw new Error(`Could not authenticate user ${username}`);
    }
};

const executeRequest = async <T>(
    path: string,
    data: { [key: string]: string }
): Promise<T> => {
    const cookie = await getCookie();

    const form = new URLSearchParams(data);
    const response = await Axios.post<T>(
        `${NEOPETS_BASE_URL}${path}`,
        form.toString(),
        {
            validateStatus: (status) =>
                status === 302 || (status >= 200 && status < 300),
            maxRedirects: 0,
            headers: {
                ...baseHeaders,
                'Content-Length': form.toString().length.toString(),
                Cookie: cookie,
            },
        }
    );

    return response.data;
};

const requestPage = async (path: string): Promise<string> => {
    const cookie = await getCookie();

    const res = await Axios.get(`${NEOPETS_BASE_URL}${path}`, {
        maxRedirects: 0,
        headers: {
            ...baseHeaders,
            Cookie: cookie,
        },
    });

    return res.data;
};

export { requestPage, executeRequest };
