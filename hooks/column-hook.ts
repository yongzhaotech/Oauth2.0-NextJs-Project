import { useT } from "next-i18next/client";
import { Ad, User, Column } from "@/types";

export const useAdsTableColumns = (): Column<Ad>[] => {
    const { t } = useT("common");
    return [
        {
            field: "id",
            title: t("adsTable.id")
        },
        {
            field: "name",
            title: t("adsTable.name"),
            sortable: true,
            href: (row: Ad) => `/ads/adDetail/${row.id}`
        },
        {
            field: "address",
            title: t("adsTable.address")
        },
        {
            field: "price",
            title: t("adsTable.price"),
            sortable: true
        },
        {
            field: "contact_email",
            title: t("adsTable.contactEmail"),
            sortable: true
        },
        {
            field: "contact_phone",
            title: t("adsTable.contactPhone"),
            sortable: true
        },
        {
            field: "create_time",
            title: t("adsTable.createTime"),
            sortable: true
        }
    ];
};

export const useUsersTableColumns = (): Column<User>[] => {
    const { t } = useT("common");
    return [
        {
            field: "id",
            title: t("usersTable.id")
        },
        {
            field: "email",
            title: t("usersTable.email"),
            sortable: true,
            href: (row: User) => `/users/userDetail/${row.id}`
        },
        {
            field: "first_name",
            title: t("usersTable.firstName"),
            sortable: true
        },
        {
            field: "last_name",
            title: t("usersTable.lastName"),
            sortable: true
        },
        {
            field: "signin_count",
            title: t("usersTable.signinCount"),
            sortable: true
        },
        {
            field: "create_time",
            title: t("usersTable.createTime"),
            sortable: true
        }
    ];
};