interface Context {
    options: {
        username: string;
        password: string;
        logFile: string;
        authEnv: boolean;
    };
}

const context: Context = {
    options: {
        username: '',
        password: '',
        logFile: 'transactions.csv',
        authEnv: false,
    },
};

export const getContext = (): Context => {
    return context;
};
