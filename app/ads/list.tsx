"use client";

import { useT } from "next-i18next/client";
import Link from "next/link";
import type { AdSummary } from "@/utils/http";
import { usePage } from "@/hooks/page-hook";
import { Navigation } from "@/components/page-navigation";

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
    const {
        data: ads,
        pages,
        pageNumber,
        setPageNumber,
        pageSize,
        setPageSize,
        sortData,
    } = usePage(list, "ads");

    return (
        <>
            <h3 className="mb-4 text-xl font-semibold">
                <Header nums={pages.length} />
            </h3>
            <Navigation
                pageNumber={pageNumber}
                setPageNumber={setPageNumber}
                pageSize={pageSize}
                setPageSize={setPageSize}
                pages={pages}
            />
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
                            <th
                                className="cursor-pointer underline border border-gray-300 px-2 py-2 text-left"
                                onClick={() => sortData("create_time")}
                            >
                                {t("adsTable.createTime")}
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
