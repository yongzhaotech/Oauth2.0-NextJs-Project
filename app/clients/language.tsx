"use client";
import { useChangeLanguage, useT } from "next-i18next/client";
const langs = {
    en: "English",
    fr: "Français",
    cn: "中文",
};

export function LanguageSwitcher() {
    const changeLanguage = useChangeLanguage();
    const { i18n } = useT();

    const change = async (e: React.ChangeEvent<HTMLSelectElement>) => {
        await changeLanguage(e.target.value as keyof typeof langs);
    };

    return (
        <select value={i18n.language} onChange={change} className="rounded border px-3 w-fit center cursor-pointer">
            {Object.entries(langs).map(([key, label]) => (
                <option key={key} value={key}>
                    {label}
                </option>
            ))}
        </select>
    );
}
