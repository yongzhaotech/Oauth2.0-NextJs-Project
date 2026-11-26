"use client";

import { useT } from "next-i18next/client";
import type { User } from "@/utils/http";
import { usePage } from "@/hooks/page-hook";
import { Table } from "@/components/table";
import { useUsersTableColumns } from "@/hooks/column-hook";
import { Navigation } from "@/components/page-navigation";

type ListProps = {
    users: User[];
};

const Header = ({ nums }: { nums: number }) => {
    const { t } = useT("common");
    if (nums === 0) return t("noUsers");
    return t("pageTitle", { count: nums });
};

export const UsersList = ({ users: list }: ListProps) => {
    const { t } = useT("common");
    const columns = useUsersTableColumns();
    const {
        data: users,
        pages,
        pageNumber,
        setPageNumber,
        pageSize,
        setPageSize,
        sortData,
        clientSearch,
    } = usePage(list, "users", "email");

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
                    data={users}
                    sortData={sortData}
                    clientSearch={{
                        ...clientSearch,
                        filterText: t("usersTable.search"),
                    }}
                />
            </div>
        </>
    );
};
