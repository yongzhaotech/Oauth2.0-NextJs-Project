import { useState, useMemo } from "react";

type Order<T> = {
    key: keyof T | null;
    ascending: boolean;
};

const collator = new Intl.Collator(undefined, { numeric: true, sensitivity: "base" });

const asFiniteNumber = (value: unknown): number | null => {
    if (typeof value === "number") {
        return Number.isFinite(value) ? value : null;
    }

    if (typeof value !== "string") return null;
    const normalized = value.trim();
    if (!/^[+-]?(?:\d+\.?\d*|\.\d+)(?:e[+-]?\d+)?$/i.test(normalized)) return null;
    const parsed = Number(normalized);
    return Number.isFinite(parsed) ? parsed : null;
};

const asTimestamp = (value: unknown): number | null => {
    if (value instanceof Date) {
        const timestamp = value.getTime();
        return Number.isFinite(timestamp) ? timestamp : null;
    }

    if (typeof value !== "string") return null;
    const normalized = value.trim();
    const looksLikeDate =
        /^\d{4}-\d{2}-\d{2}(?:[T\s])/i.test(normalized) ||
        /^[A-Z]{3}\s+[A-Z]{3}\s+\d{1,2}\s+\d{4}\s/i.test(normalized);
    if (!looksLikeDate) return null;

    const timestamp = Date.parse(normalized);
    return Number.isFinite(timestamp) ? timestamp : null;
};

const compareValues = (left: unknown, right: unknown): number => {
    // Keep missing values at the end in both ascending and descending order.
    if (left == null) return right == null ? 0 : 1;
    if (right == null) return -1;

    const leftTimestamp = asTimestamp(left);
    const rightTimestamp = asTimestamp(right);
    if (leftTimestamp !== null && rightTimestamp !== null) {
        return leftTimestamp - rightTimestamp;
    }
    if (leftTimestamp !== null) return -1;
    if (rightTimestamp !== null) return 1;

    const leftNumber = asFiniteNumber(left);
    const rightNumber = asFiniteNumber(right);

    if (leftNumber !== null && rightNumber !== null) {
        return leftNumber - rightNumber;
    }

    // Put numeric values before nonnumeric values consistently.
    if (leftNumber !== null) return -1;
    if (rightNumber !== null) return 1;

    return collator.compare(String(left), String(right));
};

const sorting = <T>(data: T[], key: keyof T, ascending: boolean = true) => {
    return [...data].sort((a, b) => {
        const comparison = compareValues(a[key], b[key]);
        // Null values remain last for either sort direction.
        if (a[key] == null || b[key] == null) return comparison;
        return ascending ? comparison : -comparison;
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
