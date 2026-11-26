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

export type User = {
    id: number;
    first_name: string;
    last_name: string;
    email: string | null;
    create_time: Date | string | null;
    signin_count: number;
}

export type AdSummary = Ad;

export type Column<T = Ad | User> = {
    field: keyof T;
    title: string;
    sortable?: boolean;
    href?: (row: T) => string
};
