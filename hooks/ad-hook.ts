import { useState, useMemo } from "react";

type Order<T> = {
    key: keyof T | null;
    ascending: boolean;
};

const sorting = <T>(data: T[], key: keyof T, ascending: boolean = true) => {
    return [...data].sort((a, b) => {
        if (a[key] < b[key]) return ascending ? -1 : 1;
        if (a[key] > b[key]) return ascending ? 1 : -1;
        return 0;
    });
};

const defaultOrder = () => ({
    key: null,
    ascending: true
})

export const useSorting = <T>(data: T[]) => {
    const [order, setOrder] = useState<Order<T>>(defaultOrder);

    const sortData = (key: keyof T) => {
        setOrder(prevOrder => ({
            key,
            ascending: !prevOrder.ascending
        }));
    };

    const sortedData = useMemo(() => {
        if (order.key === null) return data;
        return sorting(data, order.key as keyof T, order.ascending);
    }, [data, order]);

    return { sortedData, sortData };

};
