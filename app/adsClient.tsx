"use client";

import type { AdSummary } from "@/utils/http";
import { use } from "react";
import { AdList } from "./ads/list";

const AdsClient = ({ ads }: { ads: Promise<AdSummary[]> }) => {
    const resolvedAds = use(ads);

    return <AdList ads={resolvedAds} />;
};

export default AdsClient;
