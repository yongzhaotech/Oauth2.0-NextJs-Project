import { useState, useMemo, use } from "react";
import { pagination } from "@/utils/helper";
import { useSorting } from "@/hooks/sort-hook";
import { browser } from "react-dom";

const defaultPageNumber = 1;
const defaultPageSize = 5;
const allowedPageSizes = [5, 10, 15, 20, 25] as const;

const parsePositiveSafeInteger = (value: string | null): number | null => {
    if (!value || !/^[1-9]\d*$/.test(value)) return null;
    const parsed = Number(value);
    return Number.isSafeInteger(parsed) ? parsed : null;
};

const storage = (resourceName: string) => ({
    getPageNumber: () => {
        try {
            return parsePositiveSafeInteger(localStorage.getItem(`${resourceName}-pageNumber`))
                ?? defaultPageNumber;
        } catch {
            return defaultPageNumber;
        }
    },
    setPageNumber: (pageNumber: number) => {
        if (!Number.isSafeInteger(pageNumber) || pageNumber < 1) return;
        try {
            localStorage.setItem(`${resourceName}-pageNumber`, String(pageNumber));
        } catch {
            // Pagination remains usable in memory if browser storage is unavailable.
        }
    },
    getPageSize: () => {
        try {
            const storedPageSize = parsePositiveSafeInteger(localStorage.getItem(`${resourceName}-pageSize`));
            return allowedPageSizes.find(size => size === storedPageSize) ?? defaultPageSize;
        } catch {
            return defaultPageSize;
        }
    },
    setPageSize: (pageSize: number) => {
        if (!allowedPageSizes.some(size => size === pageSize)) return;
        try {
            localStorage.setItem(`${resourceName}-pageSize`, String(pageSize));
        } catch {
            // Pagination remains usable in memory if browser storage is unavailable.
        }
    },
});

export const usePage = <T,>(data: T[], resourceName: string) => {
    use(browser());
    const pageStorage = storage(resourceName);
    const [pageNumber, _setPageNumber] = useState(pageStorage.getPageNumber);
    const [pageSize, _setPageSize] = useState<number>(pageStorage.getPageSize);

    const { sortedData, sortData } = useSorting(data);

    const paginatedData = useMemo(() => {
        return pagination(sortedData, pageSize);
    }, [sortedData, pageSize]);

    const pages = Object.keys(paginatedData);
    // The saved page can outlive the data set. Clamp it so the table does not
    // render an empty page when fewer pages are available now.
    const currentPage = Math.min(pageNumber, Math.max(pages.length, 1));

    const setPageNumber = (nextPage: number) => {
        if (!Number.isSafeInteger(nextPage) || nextPage < 1 || nextPage > Math.max(pages.length, 1)) return;
        _setPageNumber(nextPage);
        pageStorage.setPageNumber(nextPage);
    };
    const setPageSize = (nextPageSize: number) => {
        if (!allowedPageSizes.some(size => size === nextPageSize)) return;
        _setPageSize(nextPageSize);
        pageStorage.setPageSize(nextPageSize);
    };

    const list = paginatedData[currentPage] ?? [];

    return {
        pageNumber: currentPage,
        setPageNumber,
        pageSize,
        setPageSize,
        sortData,
        data: list,
        pages
    };
};
