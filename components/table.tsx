"use client";

import Link from "next/link";
import { Ad, User, Column } from "@/types";

type TableProps<T = Ad | User> = {
    columns: Column<T>[];
    data: T[];
    sortData: (field: keyof T) => void;
};

const Header = <T,>({
    column,
    sortData,
}: {
    column: Column<T>;
    sortData: (field: keyof T) => void;
}) => {
    if (column.sortable) {
        return (
            <th
                key={String(column.field)}
                className="cursor-pointer underline border border-gray-300 px-2 py-2 text-left"
                onClick={() => sortData(column.field)}
            >
                {column.title}
            </th>
        );
    }
    return (
        <th
            key={String(column.field)}
            className="border border-gray-300 px-2 py-2 text-left"
        >
            {column.title}
        </th>
    );
};

export const Table = <T,>({ columns, data, sortData }: TableProps<T>) => {
    return (
        <table className="w-full border-collapse border border-gray-300">
            <thead>
                <tr>
                    {columns.map((column) => (
                        <Header
                            key={String(column.field)}
                            column={column}
                            sortData={sortData}
                        />
                    ))}
                </tr>
            </thead>
            <tbody>
                {data.map((row, rowIndex) => (
                    <tr key={rowIndex}>
                        {columns.map((column) => (
                            <td
                                key={String(column.field)}
                                className="border border-gray-300 px-2 py-2"
                            >
                                {column.href ? (
                                    <Link
                                        href={column.href(row)}
                                        className="text-blue-700 underline"
                                    >
                                        {String(row[column.field] ?? "")}
                                    </Link>
                                ) : (
                                    String(row[column.field] ?? "")
                                )}
                            </td>
                        ))}
                    </tr>
                ))}
            </tbody>
        </table>
    );
};
