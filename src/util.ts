export const sleep = async (time: number): Promise<void> =>
    new Promise((resolve) => setTimeout(resolve, time));
