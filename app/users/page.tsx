import { getT } from 'next-i18next/server';
import { ErrorBoundary } from "react-error-boundary";
import { Suspense } from "react";
import { getUsers } from "@/utils/http";
import UsersClient from "./usersClient";

export const instant = false;

const Home = async () => {
    const { t } = await getT('common');
    
    return (
    <main className="flex-1 p-4 sm:p-8">
        <div className="mx-auto w-full max-w-3xl text-center">
            <h2 className="mb-4 text-2xl font-semibold">{t('usersTable.title')}</h2>
            <ErrorBoundary fallback={<p>{t('failedToLoadUser')}</p>}>
                <Suspense fallback={<p>{t('loadingUser')}</p>}>
                    <UsersClient users={getUsers()} />
                </Suspense>
            </ErrorBoundary>
        </div>
    </main>
    );
}

export default Home;
