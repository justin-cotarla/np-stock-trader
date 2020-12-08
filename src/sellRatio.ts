const sellRatios = {
    0: 0,
    61: 0.75,
    101: 0.25,
    151: 0.25,
    201: 0.5,
    251: 0.75,
    301: 0.5,
    351: 0.75,
    401: 0.5,
    851: 0.5,
    901: 0.5,
    1001: 0.5,
    1201: 0.5,
};

export const getSellRatio = (price: number): number => {
    let sellRatio = 0;
    Object.entries(sellRatios).forEach(([mapPrice, mapRatio]) => {
        if (price < parseInt(mapPrice)) {
            return sellRatio;
        }
        sellRatio = mapRatio;
    });
    return 0;
};
