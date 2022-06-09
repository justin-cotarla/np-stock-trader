import dotenv from 'dotenv';

import { getContext } from './context';
import { CliOptions } from './types';

export const parseConfig = ({
    username,
    password,
    logFile,
    authEnv,
}: CliOptions): void => {
    if ((!username || !password) && !authEnv) {
        console.log('Authentication information required');
        process.exit(0);
    }

    getContext().options = {
        ...getContext().options,
        ...(logFile ? { logFile } : {}),
        ...(authEnv ? { authEnv } : {}),
    };

    if (authEnv) {
        dotenv.config();
        getContext().options = {
            ...getContext().options,
            username: process.env.NP_USERNAME as string,
            password: process.env.NP_PASSWORD as string,
        };
    } else {
        getContext().options = {
            ...getContext().options,
            username,
            password,
        };
    }
};
