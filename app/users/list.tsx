"use client";

import { useT } from "next-i18next/client";
import Link from "next/link";
import type { User } from "@/utils/http";
import { usePage } from "@/hooks/page-hook";
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
    const {
        data: users,
        pages,
        pageNumber,
        setPageNumber,
        pageSize,
        setPageSize,
        sortData,
    } = usePage(list, "users");

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
                                {t("usersTable.id")}
                            </th>
                            <th
                                className="cursor-pointer underline border border-gray-300 px-2 py-2 text-left"
                                onClick={() => sortData("email")}
                            >
                                {t("usersTable.email")}
                            </th>
                            <th
                                className="cursor-pointer underline border border-gray-300 px-2 py-2 text-left"
                                onClick={() => sortData("first_name")}
                            >
                                {t("usersTable.firstName")}
                            </th>
                            <th
                                className="cursor-pointer underline border border-gray-300 px-2 py-2 text-left"
                                onClick={() => sortData("last_name")}
                            >
                                {t("usersTable.lastName")}
                            </th>
                            <th
                                className="cursor-pointer underline border border-gray-300 px-2 py-2 text-left"
                                onClick={() => sortData("signin_count")}
                            >
                                {t("usersTable.signinCount")}
                            </th>
                            <th
                                className="cursor-pointer underline border border-gray-300 px-2 py-2 text-left"
                                onClick={() => sortData("create_time")}
                            >
                                {t("usersTable.createTime")}
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(
                            ({
                                id,
                                first_name,
                                last_name,
                                email,
                                create_time,
                                signin_count,
                            }) => (
                                <tr key={id}>
                                    <td className="border border-gray-300 px-2 py-2">
                                        {id}
                                    </td>
                                    <td className="border border-gray-300 px-2 py-2">
                                        <Link
                                            className="text-blue-700 underline"
                                            href={`/users/userDetail/${id}`}
                                        >
                                            {email}
                                        </Link>
                                    </td>
                                    <td className="border border-gray-300 px-2 py-2 text-left">
                                        {first_name ??
                                            t("usersTable.notAvailable")}
                                    </td>
                                    <td className="border border-gray-300 px-2 py-2 text-left">
                                        {last_name ??
                                            t("usersTable.notAvailable")}
                                    </td>
                                    <td className="border border-gray-300 px-2 py-2 text-left">
                                        {signin_count ??
                                            t("usersTable.notAvailable")}
                                    </td>
                                    <td className="border border-gray-300 px-2 py-2">
                                        {create_time?.toString() ??
                                            t("usersTable.notAvailable")}
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
