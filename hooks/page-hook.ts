import { useState, useMemo } from "react";
import { pagination } from "@/utils/helper";
import { useSorting } from "@/hooks/sort-hook";

export const usePage = <T,>(data: T[]) => {
    const [pageNumber, setPageNumber] = useState(1);
    const [pageSize, setPageSize] = useState(5);
    const { sortedData, sortData } = useSorting(data);

    const paginatedData = useMemo(() => {
        return pagination(sortedData, pageSize);
    }, [sortedData, pageSize]);

    const list = paginatedData[pageNumber] ?? [];

    return {
        pageNumber,
        setPageNumber,
        pageSize,
        setPageSize,
        sortData,
        data: list,
        pages: Object.keys(paginatedData)
    };
}