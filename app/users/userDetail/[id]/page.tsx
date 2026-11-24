import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { getUserDetail, User } from "@/utils/http";
import Link from "next/link";
import {  getT } from "next-i18next/server";

export const instant = false;

type PageProps = {
    params: Promise<{ id: string }>;
};

function formatDate(value: User["create_time"]): string | null {
    if (!value) return null;

    const date = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(date.getTime())) return String(value);

    return new Intl.DateTimeFormat("en-CA", {
        dateStyle: "medium",
        timeStyle: "short",
        timeZone: "America/Toronto",
    }).format(date);
}

async function UserDetails({ params }: PageProps) {
    const { t } = await getT();
    const { id } = await params;
    const user = (await getUserDetail(id)) as User;

    const createdAt = formatDate(user.create_time);

    return (
        <article className="mx-auto w-full max-w-3xl space-y-6 rounded-xl bg-white p-6 shadow-sm">
            <Link className="text-blue-700 underline" href="/users">
                {t("userDetails.backToUsers")}
            </Link>
            <header className="space-y-2">
                <p className="text-sm text-gray-500">{t("userDetails.userId", { id: user.id })}</p>
                <h2 className="text-3xl font-semibold">{user.first_name} {user.last_name}</h2>
            </header>

            {createdAt && (
                <p className="text-sm text-gray-500">{t("userDetails.createTime")}: {createdAt}</p>
            )}
        </article>
    );
}

const Page = async ({ params }: PageProps) => {
    const { t } = await getT();
            return (
        <main className="flex-1 bg-gray-50 p-4 sm:p-8">
        <ErrorBoundary fallback={<p>{t("userDetails.failedToLoadUser")}</p>}>
            <Suspense fallback={<p>{t("userDetails.loadingUser")}</p>}>
                <UserDetails params={params} />
            </Suspense>
        </ErrorBoundary>
        </main>
    );
};

export default Page;
