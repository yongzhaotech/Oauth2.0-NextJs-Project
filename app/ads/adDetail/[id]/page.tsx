import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { getAdDetail, Ad } from "@/utils/http";
import Link from "next/link";
import {  getT } from "next-i18next/server";

export const instant = false;

type PageProps = {
    params: Promise<{ id: string }>;
};

function formatDate(value: Ad["create_time"]): string | null {
    if (!value) return null;

    const date = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(date.getTime())) return String(value);

    return new Intl.DateTimeFormat("en-CA", {
        dateStyle: "medium",
        timeStyle: "short",
        timeZone: "America/Toronto",
    }).format(date);
}

async function AdDetails({ params }: PageProps) {
    const { t } = await getT();
    const { id } = await params;
    const ad = (await getAdDetail(id)) as Ad;

    const isFree = ad.is_free === true || Number(ad.is_free) === 1;
    const price = isFree
        ? t("details.free")
        : `${ad.currency ? `${ad.currency} ` : ""}${ad.price ?? t("details.contactForPrice")}`;
    const createdAt = formatDate(ad.create_time);

    return (
        <article className="mx-auto w-full max-w-3xl space-y-6 rounded-xl bg-white p-6 shadow-sm">
            <Link className="text-blue-700 underline" href="/">
                {t("details.backToAds")}
            </Link>
            <header className="space-y-2">
                <p className="text-sm text-gray-500">{t("details.adId", { id: ad.id })}</p>
                <h2 className="text-3xl font-semibold">{ad.name}</h2>
                <p className="text-xl font-medium">{t("details.price")}: {price}</p>
            </header>

            <section>
                <h3 className="mb-2 text-lg font-semibold">{t("details.description")}</h3>
                <p className="whitespace-pre-wrap text-gray-700">
                    {typeof ad.description === "string"
                        ? ad.description
                        : t("details.noDescription")}
                </p>
            </section>

            {ad.address && (
                <section>
                    <h3 className="mb-1 font-semibold">{t("adsTable.address")}</h3>
                    <p>{ad.address}</p>
                </section>
            )}

            {(ad.contact_email || ad.contact_phone) && (
                <section>
                    <h3 className="mb-2 text-lg font-semibold">{t("details.contact")}</h3>
                    <div className="space-y-1">
                        {ad.contact_email && (
                            <p>
                                {t("details.contactEmail")}:{" "}
                                <a
                                    className="underline"
                                    href={`mailto:${ad.contact_email}`}
                                >
                                    {ad.contact_email}
                                </a>
                            </p>
                        )}
                        {ad.contact_phone && (
                            <p>
                                {t("details.contactPhone")}:{" "}
                                <a
                                    className="underline"
                                    href={`tel:${ad.contact_phone}`}
                                >
                                    {ad.contact_phone}
                                </a>
                            </p>
                        )}
                    </div>
                </section>
            )}

            {createdAt && (
                <p className="text-sm text-gray-500">{t("details.posted")} {createdAt}</p>
            )}
        </article>
    );
}

const Page = async ({ params }: PageProps) => {
    const { t } = await getT();
            return (
        <main className="flex-1 bg-gray-50 p-4 sm:p-8">
        <ErrorBoundary fallback={<p>{t("details.failedToLoadAdvertisement")}</p>}>
            <Suspense fallback={<p>{t("details.loadingAdvertisement")}</p>}>
                <AdDetails params={params} />
            </Suspense>
        </ErrorBoundary>
        </main>
    );
};

export default Page;
