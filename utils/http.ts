import "server-only";
import { cache } from "react";
import { mysql as sql } from "@/utils/mysql";
import { cacheLife } from "next/cache";

export type Ad = {
    id: number;
    name: string;
    description?: string;
    address: string | null;
    is_free: number | boolean;
    currency: string | null;
    price: number | string | null;
    contact_method: string | null;
    contact_email: string | null;
    contact_phone: string | null;
    create_time: Date | string | null;
};

export type AdSummary = Ad;

function decodeBlobText(value: unknown): string | undefined {
    if (typeof value === "string") return value;
    if (value instanceof Uint8Array) return new TextDecoder().decode(value);

    // A Buffer can arrive in its JSON form after crossing a serialization boundary.
    if (
        value &&
        typeof value === "object" &&
        "data" in value &&
        Array.isArray(value.data)
    ) {
        return new TextDecoder().decode(new Uint8Array(value.data));
    }

    return undefined;
}

export const getAdDetail = cache(async (id: number | string) => {
    await new Promise((resolve) => setTimeout(resolve, 1500)); // Ensure async context before try block

    try {
        const ad = await new Promise<Ad | null>((resolve, reject) => {
            sql.handle.query<Ad[]>(
                `select id, name, description, address, is_free, currency, price,
                        contact_method, contact_email, contact_phone, create_time
                 from advertise where id = ?`,
                [id],
                (error, ads) => {
                    if (error) {
                        reject(error);
                        return;
                    }

                    const ad = ads[0];
                    resolve(ad ? { ...ad, description: decodeBlobText(ad.description) } : null);
                }
            );
        });

        if (!ad) {
            throw new Error("Ad not found");
        }

        return ad;
    } catch (error) {
        throw error;
    }
});

export const getAds = async (): Promise<Ad[]> => {
    "use cache";
    cacheLife({
        stale: 60,       // client can reuse the result for 1 minute
        revalidate: 300, // server revalidates after 5 minutes
        expire: 3600,   // require fresh data after 1 hour
    });
    
    await new Promise((resolve) => setTimeout(resolve, 1500)); // Ensure async context before try block

    try {
        const ads = await new Promise<Ad[]>((resolve, reject) => {
            sql.handle.query<Ad[]>(
                "select id, name, description, address, is_free, currency, price, contact_method, contact_email, contact_phone, create_time from advertise order by create_time desc",
                (error, ads) => {
                    if (error) {
                        reject(error);
                        return;
                    }

                    resolve(ads.map(ad => ({ ...ad, description: decodeBlobText(ad.description) })));
                }
            );
        });

        return ads;
    } catch (error) {
        throw error;
    }
};
