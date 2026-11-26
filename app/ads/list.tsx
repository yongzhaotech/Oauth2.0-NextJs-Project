"use client";

import { useT } from "next-i18next/client";
import type { AdSummary } from "@/types";
import { usePage } from "@/hooks/page-hook";
import { useAdsTableColumns } from "@/hooks/column-hook";
import { Table } from "@/components/table";
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
    const columns = useAdsTableColumns();
    const {
        data: ads,
        pages,
        pageNumber,
        setPageNumber,
        pageSize,
        setPageSize,
        sortData,
        clientSearch,
    } = usePage(list, "ads", "name");

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
                <Table
                    columns={columns}
                    data={ads}
                    sortData={sortData}
                    clientSearch={{
                        ...clientSearch,
                        filterText: t("adsTable.search"),
                    }}
                />
            </div>
        </>
    );
};
