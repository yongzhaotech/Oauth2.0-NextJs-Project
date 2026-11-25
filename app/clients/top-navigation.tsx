"use client";

import Link from "next/link";
import { useT } from "next-i18next/client";
import { LanguageSwitcher } from "./language";

export const TopNavigation = () => {
    const { t } = useT();
    return (
        <nav>
            <LanguageSwitcher />
            <Link className="text-blue-700 underline px-3 py-1" href="/">
                {t("navs.home")}
            </Link>
            <Link className="text-blue-700 underline px-3 py-1" href="/users">
                {t("navs.users")}
            </Link>
        </nav>
    );
};
