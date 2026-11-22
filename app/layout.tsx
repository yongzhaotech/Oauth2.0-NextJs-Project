import { initServerI18next, getT, getResources } from "next-i18next/server";
import { I18nProvider } from "next-i18next/client";
import i18nConfig from "../i18n.config";
import { Suspense, type ReactNode } from "react";
import { Geist, Geist_Mono } from "next/font/google";
import { connection } from "next/server";
import "./globals.css";
import { AppAuthProvider, LanguageSwitcher } from "./clients";
import { getAccessTokenPayload } from "@/utils/auth";

initServerI18next(i18nConfig);

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

async function RequestContent({ children }: { children: ReactNode }) {
    await connection();
    const { i18n, lng, t } = await getT("common");
    const resources = getResources(
        i18n,
        ["common"],
        [lng, i18nConfig.fallbackLng]
    );
    const accessTokenPayload = await getAccessTokenPayload();
    const name =
        typeof accessTokenPayload?.name === "string"
            ? accessTokenPayload.name
            : "";

    return (
        <I18nProvider language={lng} resources={resources}>
            <header className="w-full border-b border-gray-200 bg-white px-4 py-3 text-center">
                <h1 className="text-xl font-semibold">
                    {t("siteTitle", { name })}
                </h1>
                <LanguageSwitcher />
            </header>
            <AppAuthProvider isAuthenticated={Boolean(accessTokenPayload)}>
                {children}
            </AppAuthProvider>
        </I18nProvider>
    );
}

export default async function RootLayout({
    children,
}: {
    children: ReactNode;
}) {
    return (
        <html
            lang={i18nConfig.fallbackLng}
            className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
        >
            <body className="min-h-full flex flex-col">
                <Suspense fallback={null}>
                    <RequestContent>{children}</RequestContent>
                </Suspense>
            </body>
        </html>
    );
}
