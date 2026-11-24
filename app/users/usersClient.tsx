"use client";

import type { User } from "@/utils/http";
import { use } from "react";
import { UsersList } from "./list";

const UsersClient = ({ users }: { users: Promise<User[]> }) => {
    const resolvedUsers = use(users);

    return <UsersList users={resolvedUsers} />;
};

export default UsersClient;
