import { Suspense } from "react";
import { RegisterPage } from "@/features/auth/components/register-page";

export default function RegisterRoute() {
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
      <RegisterPage />
    </Suspense>
  );
}
