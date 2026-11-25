import type { ReactNode } from "react";
import { getT } from "next-i18next/server";
import { getUserAccessLevel } from "@/utils/auth";

export default async function UsersLayout({
    children,
}: {
    children: ReactNode;
}) {
    const { t } = await getT();
    const accessLevel = await getUserAccessLevel();

    if (accessLevel === null || accessLevel < 2) {
        return (
            <p className="text-red-500 text-center font-bold py-4">
                {t("notAllowed")}
            </p>
        );
    }

    return <>{children}</>;
}
