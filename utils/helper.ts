export const pagination = <T>(list: T[], pageSize = 5) => {
    return list.reduce(
        (accumulation, currentListItem, index) => {
            const pageNumber = Math.floor(index / pageSize) + 1;
            if (accumulation[pageNumber] == undefined) {
                accumulation[pageNumber] = [];
            }
            accumulation[pageNumber].push(currentListItem);

            return accumulation;
        },
        {} as Record<string, T[]>
    );
};