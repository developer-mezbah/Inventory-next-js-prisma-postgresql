import { cookies } from "next/headers";

export async function getCompanyId() {
    const cookieStore = await cookies();
    return cookieStore.get('companyId')?.value || null;
}

export async function clearCompanyId() {
    const cookieStore = await cookies();
    return cookieStore.delete('companyId');
}