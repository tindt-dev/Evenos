import { Suspense } from "react";
import { LoginPage } from "@/features/auth/components/login-page";

export default function LoginRoute() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-stone-100">
          <div className="rounded-full border border-stone-300 bg-white px-4 py-2 text-sm text-stone-600">
            Loading...
          </div>
        </main>
      }
    >
      <LoginPage />
    </Suspense>
  );
}
