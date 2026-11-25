import type { ReactNode } from "react";
import { getT } from "next-i18next/server";

export default async function RootLayout({
    children,
}: {
    children: ReactNode;
}) {
    const { t } = await getT();
    return (
        <>
            <header className="w-full px-4 py-2 text-center">
                <h2 className="text-lg font-medium text-gray-700">
                    {t("userDetails.title")}
                </h2>
            </header>
            {children}
        </>
    );
}
