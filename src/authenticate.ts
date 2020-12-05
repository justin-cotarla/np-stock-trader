import { URLSearchParams } from 'url';
import axios from 'axios';

const NEOPETS_BASE_URL = 'http://www.neopets.com';

const authenticate = async (
    username: string,
    password: string
): Promise<void> => {
    const loginForm = new URLSearchParams({
        destination: '',
        return_format: '1',
        username,
        password,
    });

    const initialRes = await axios(`${NEOPETS_BASE_URL}/login/`, {
        method: 'GET',
        headers: {
            Accept:
                'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
            'Accept-Encoding': 'gzip, deflate',
            'Accept-Language': 'en-US,en;q=0.9',
            'Cache-Control': 'max-age=0',
            Connection: 'keep-alive',
            'Content-Length': loginForm.toString().length.toString(),
            'Content-Type': 'application/x-www-form-urlencoded',
            Host: 'www.neopets.com',
            Origin: 'http://www.neopets.com',
            Referer: 'http://www.neopets.com/login/',
            'Upgrade-Insecure-Requests': '1',
            'User-Agent':
                'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/86.0.4240.198 Safari/537.36',
        },
    });

    const cookies = initialRes.headers['set-cookie'].map(
        (cookie: string) => cookie.split('; ')[0]
    );

    const cookieString = cookies.join('; ');

    await new Promise((resolve) => setTimeout(resolve, 1000));

    const cookieRes = await axios(`${NEOPETS_BASE_URL}/login.phtml`, {
        data: loginForm.toString(),
        method: 'POST',
        headers: {
            Cookie: cookieString,
            Accept:
                'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
            'Accept-Encoding': 'gzip, deflate',
            'Accept-Language': 'en-US,en;q=0.9',
            'Cache-Control': 'max-age=0',
            Connection: 'keep-alive',
            'Content-Length': loginForm.toString().length.toString(),
            'Content-Type': 'application/x-www-form-urlencoded',
            Host: 'www.neopets.com',
            Origin: 'http://www.neopets.com',
            Referer: 'http://www.neopets.com/login/',
            'Upgrade-Insecure-Requests': '1',
            'User-Agent':
                'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/86.0.4240.198 Safari/537.36',
        },
    });
    console.log(cookieRes.data.includes('SIGN-UP'));
};

export default authenticate;
