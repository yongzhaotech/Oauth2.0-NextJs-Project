"use client";

import { useState, useMemo } from "react";
import { useT } from "next-i18next/client";
import Link from "next/link";
import type { AdSummary } from "@/utils/http";
import { pagination } from "@/utils/helper";
import { useSorting } from "@/hooks/ad-hook";

type ListProps = {
    ads: AdSummary[];
};

const Header = ({ nums }: { nums: number }) => {
    const { t } = useT("common");
    if (nums === 0) return t("noAds");
    return t("pageTitle", { count: nums });
};

export const AdList = ({ ads: list }: ListProps) => {
    const { t } = useT("common");
    const { sortedData, sortData } = useSorting(list);
    const [pageNumber, setPageNumber] = useState(1);
    const [pageSize, setPageSize] = useState(5);
    const paginatedAds = useMemo(
        () => pagination<AdSummary>(sortedData, pageSize),
        [sortedData, pageSize]
    );
    const ads = paginatedAds[pageNumber] ?? [];

    return (
        <>
            <h3 className="mb-4 text-xl font-semibold">
                <Header nums={Object.keys(paginatedAds).length} />
            </h3>
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
                            {t("adsTable.pageSize", { size })}
                        </option>
                    ))}
                </select>
                {Object.keys(paginatedAds).map((page) => (
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
            <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-300">
                    <thead>
                        <tr>
                            <th className="border border-gray-300 px-2 py-2 text-left">
                                {t("adsTable.id")}
                            </th>
                            <th
                                className="cursor-pointer underline border border-gray-300 px-2 py-2 text-left"
                                onClick={() => sortData("name")}
                            >
                                {t("adsTable.name")}
                            </th>
                            <th className="border border-gray-300 px-2 py-2 text-left">
                                {t("adsTable.address")}
                            </th>
                            <th
                                className="cursor-pointer underline border border-gray-300 px-2 py-2 text-left"
                                onClick={() => sortData("price")}
                            >
                                {t("adsTable.price")}
                            </th>
                            <th
                                className="cursor-pointer underline border border-gray-300 px-2 py-2 text-left"
                                onClick={() => sortData("contact_email")}
                            >
                                {t("adsTable.contactEmail")}
                            </th>
                            <th
                                className="cursor-pointer underline border border-gray-300 px-2 py-2 text-left"
                                onClick={() => sortData("contact_phone")}
                            >
                                {t("adsTable.contactPhone")}
                            </th>
                            <th className="border border-gray-300 px-2 py-2">
                                {t("adsTable.createdTime")}
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {ads.map(
                            ({
                                id,
                                name,
                                address,
                                price,
                                contact_email,
                                contact_phone,
                                create_time,
                            }) => (
                                <tr key={id}>
                                    <td className="border border-gray-300 px-2 py-2">
                                        {id}
                                    </td>
                                    <td className="border border-gray-300 px-2 py-2">
                                        <Link
                                            className="text-blue-700 underline"
                                            href={`/ads/adDetail/${id}`}
                                        >
                                            {name}
                                        </Link>
                                    </td>
                                    <td className="border border-gray-300 px-2 py-2 text-left">
                                        {address ?? t("adsTable.notAvailable")}
                                    </td>
                                    <td className="border border-gray-300 px-2 py-2 text-left">
                                        {price ?? t("adsTable.notAvailable")}
                                    </td>
                                    <td className="border border-gray-300 px-2 py-2 text-left">
                                        {contact_email ??
                                            t("adsTable.notAvailable")}
                                    </td>
                                    <td className="border border-gray-300 px-2 py-2 text-left">
                                        {contact_phone ??
                                            t("adsTable.notAvailable")}
                                    </td>
                                    <td className="border border-gray-300 px-2 py-2">
                                        {create_time?.toString() ??
                                            t("adsTable.notAvailable")}
                                    </td>
                                </tr>
                            )
                        )}
                    </tbody>
                </table>
            </div>
        </>
    );
};
