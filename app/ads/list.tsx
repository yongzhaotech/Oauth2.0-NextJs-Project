"use client";

import { useState, useMemo } from "react";
import { useT } from "next-i18next/client";
import Link from "next/link";
import type { AdSummary } from "@/utils/http";
import { pagination } from "@/utils/helper";

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
    const [pageNumber, setPageNumber] = useState(1);
    const paginatedAds = useMemo(() => pagination<AdSummary>(list), [list]);
    const ads = paginatedAds[pageNumber] ?? [];

    return (
        <>
            <h3 className="mb-4 text-xl font-semibold">
                <Header nums={Object.keys(paginatedAds).length} />
            </h3>
            <nav className="flex justify-center gap-1 mb-4">
                {Object.keys(paginatedAds).map((page) => (
                    <button
                        key={page}
                        onClick={() => setPageNumber(Number(page))}
                        className={`rounded border px-3 py-1 ${pageNumber === Number(page) ? "bg-gray-200" : ""}`}
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
                            <th className="border border-gray-300 px-2 py-2 text-left">
                                {t("adsTable.name")}
                            </th>
                            <th className="border border-gray-300 px-2 py-2 text-left">
                                {t("adsTable.address")}
                            </th>
                            <th className="border border-gray-300 px-2 py-2 text-left">
                                {t("adsTable.price")}
                            </th>
                            <th className="border border-gray-300 px-2 py-2 text-left">
                                {t("adsTable.contactEmail")}
                            </th>
                            <th className="border border-gray-300 px-2 py-2 text-left">
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
