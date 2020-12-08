import { URLSearchParams } from 'url';
import Axios from 'axios';

let cookieString: string | null = null;

const NEOPETS_BASE_URL = 'http://www.neopets.com';

const baseHeaders = {
    Accept:
        'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
    'Accept-Encoding': 'gzip, deflate',
    'Accept-Language': 'en-US,en;q=0.9',
    'Cache-Control': 'max-age=0',
    Connection: 'keep-alive',
    'Content-Type': 'application/x-www-form-urlencoded',
    Host: 'www.neopets.com',
    Origin: 'http://www.neopets.com',
    'Upgrade-Insecure-Requests': '1',
    'User-Agent':
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/86.0.4240.198 Safari/537.36',
};

const authenticate = async (
    username: string,
    password: string
): Promise<string> => {
    const loginForm = new URLSearchParams({
        destination: '',
        return_format: '1',
        username,
        password,
    });

    try {
        const res = await Axios.post(
            `${NEOPETS_BASE_URL}/login.phtml`,
            loginForm.toString(),
            {
                validateStatus: (status) => status === 302,
                maxRedirects: 0,
                headers: {
                    ...baseHeaders,
                    'Content-Length': loginForm.toString().length.toString(),
                },
            }
        );
        const cookies = res.headers['set-cookie'].map(
            (cookie: string) => cookie.split('; ')[0]
        );

        return cookies.join('; ');
    } catch (err) {
        throw new Error(`Could not authenticate user ${username}`);
    }
};

const executeRequest = async (
    path: string,
    data: { [key: string]: string | undefined }
): Promise<void> => {
    if (cookieString === null) {
        cookieString = await authenticate(
            global.options.username,
            global.options.password
        );
    }

    const form = new URLSearchParams(data);
    await Axios.post(`${NEOPETS_BASE_URL}${path}`, form.toString(), {
        validateStatus: (status) => status === 302,
        maxRedirects: 0,
        headers: {
            ...baseHeaders,
            'Content-Length': form.toString().length.toString(),
            Cookie: cookieString,
        },
    });
};

const requestPage = async (path: string): Promise<string> => {
    if (cookieString === null) {
        cookieString = await authenticate(
            global.options.username,
            global.options.password
        );
    }

    const res = await Axios.get(`${NEOPETS_BASE_URL}${path}`, {
        maxRedirects: 0,
        headers: {
            ...baseHeaders,
            Cookie: cookieString,
        },
    });

    return res.data;
};

export { requestPage, executeRequest };
