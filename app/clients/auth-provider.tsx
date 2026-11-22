import type { ReactNode } from "react";
import { getT } from 'next-i18next/server';

export const AppAuthProvider = async ({
    children,
    isAuthenticated,
}: {
    children: ReactNode;
    isAuthenticated: boolean;
}) => {
    if (!isAuthenticated) {
        const { t } = await getT('common');
        return (
            <main className="flex flex-1 items-center justify-center">
                <a className="rounded bg-blue-600 px-4 py-2 font-medium text-white" href="/api/auth/login">
                    {t('signIn')}
                </a>
            </main>
        );
    }

    return children;
};
