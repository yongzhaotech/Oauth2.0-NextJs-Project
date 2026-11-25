"use client";

import { useT } from "next-i18next/client";

type NavigationProps = {
    pageSize: number;
    setPageSize: (size: number) => void;
    pageNumber: number;
    setPageNumber: (page: number) => void;
    pages: string[];
};

export const Navigation = ({
    pageSize,
    setPageSize,
    pageNumber,
    setPageNumber,
    pages,
}: NavigationProps) => {
    const { t } = useT("common");

    return (
        <nav className="flex justify-center gap-1 mb-4">
            <select
                value={pageSize}
                onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setPageNumber(1);
                }}
                className="rounded border px-3 py-1 cursor-pointer"
            >
                {[5, 10, 15, 20, 25].map((size) => (
                    <option key={size} value={size}>
                        {t("pageSize", { size })}
                    </option>
                ))}
            </select>
            {pages.map((page) => (
                <button
                    key={page}
                    onClick={() => setPageNumber(Number(page))}
                    className={`rounded cursor-pointer border px-3 py-1 ${pageNumber === Number(page) ? "bg-gray-200" : ""}`}
                    disabled={pageNumber === Number(page)}
                >
                    {page}
                </button>
            ))}
        </nav>
    );
};
