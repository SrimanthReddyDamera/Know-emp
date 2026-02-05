import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { email } = await request.json();
    const supabase = await createClient();

    // Check if user is an employee (not admin)
    const { data: employee } = await supabase
      .from("employees")
      .select("role")
      .eq("email", email)
      .single();

    if (!employee) {
      return NextResponse.json(
        { error: "No account found with this email" },
        { status: 404 }
      );
    }

    if (employee.role === "admin") {
      return NextResponse.json(
        { error: "Admins cannot reset passwords via email. Please contact support." },
        { status: 403 }
      );
    }

    const origin = request.headers.get("origin");

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${origin || process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/api/auth/confirm?next=/reset-password`,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
