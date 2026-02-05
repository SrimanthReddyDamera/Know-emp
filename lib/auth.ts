import { createClient } from "@/lib/supabase/server";

export type UserRole = "admin" | "employee" | "tech_support";

export interface Employee {
  id: string;
  auth_user_id: string;
  full_name: string;
  email: string;
  role: UserRole;
  status: string;
  phone?: string;
  department?: string;
  designation?: string;
  created_at: string;
  share_password_with_admin?: boolean;
  visible_password?: string;
}

/**
 * Get the current authenticated user from Supabase
 */
export async function getCurrentUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

/**
 * Get the employee record for the current user
 */
export async function getCurrentEmployee(): Promise<Employee | null> {
  const supabase = await createClient();
  const user = await getCurrentUser();

  if (!user) return null;

  const { data, error } = await supabase
    .from("employees")
    .select("*")
    .eq("auth_user_id", user.id)
    .single();

  if (error || !data) return null;

  return data as Employee;
}

/**
 * Get the role of the current user
 */
export async function getUserRole(): Promise<UserRole | null> {
  const employee = await getCurrentEmployee();
  return employee?.role as UserRole | null;
}

/**
 * Check if the current user is an admin
 */
export async function isAdmin(): Promise<boolean> {
  const role = await getUserRole();
  return role === "admin";
}

/**
 * Check if the current user is active
 */
export async function isActiveUser(): Promise<boolean> {
  const employee = await getCurrentEmployee();
  return employee?.status === "active";
}
