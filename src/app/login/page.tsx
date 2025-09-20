import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/server/auth";
import { AuthForm } from "@/app/_components/auth/auth-form";
import { Button } from "@/components/ui/button";

export default async function LoginPage() {
  const session = await auth();

  if (session?.user) {
    redirect("/");
  }

  return (
    <main className="flex min-h-screen flex-col bg-gradient-to-br from-primary/5 to-background">

      <div className="flex-1 flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <AuthForm mode="login" />
          <div className="text-center mt-6">
            <div className="flex items-center justify-center gap-2 text-sm">
              <span className="text-muted-foreground">Don't have an account?</span>
              <Button asChild variant="outline" size="sm">
                <Link href="/register">
                  Sign Up
                </Link>
              </Button>
            </div>
            <Link href="/" className="text-primary hover:text-primary/90 underline text-sm mt-2 inline-block">
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
