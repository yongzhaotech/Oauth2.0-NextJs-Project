"use client";

import { useState, useMemo } from "react";
import { useT } from "next-i18next/client";
import Link from "next/link";
import type { User } from "@/utils/http";
import { pagination } from "@/utils/helper";
import { useSorting } from "@/hooks/ad-hook";

type ListProps = {
    users: User[];
};

const Header = ({ nums }: { nums: number }) => {
    const { t } = useT("common");
    if (nums === 0) return t("noAds");
    return t("pageTitle", { count: nums });
};

export const UsersList = ({ users: list }: ListProps) => {
    const { t } = useT("common");
    const { sortedData, sortData } = useSorting(list);
    const [pageNumber, setPageNumber] = useState(1);
    const [pageSize, setPageSize] = useState(5);
    const paginatedUsers = useMemo(
        () => pagination<User>(sortedData, pageSize),
        [sortedData, pageSize]
    );
    const users = paginatedUsers[pageNumber] ?? [];

    return (
        <>
            <h3 className="mb-4 text-xl font-semibold">
                <Header nums={Object.keys(paginatedUsers).length} />
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
                {Object.keys(paginatedUsers).map((page) => (
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
                            <th className="border border-gray-300 px-2 py-2">
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
                                        {first_name ?? t("usersTable.notAvailable")}
                                    </td>
                                    <td className="border border-gray-300 px-2 py-2 text-left">
                                        {last_name ?? t("usersTable.notAvailable")}
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
