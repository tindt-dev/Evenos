"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/ui/card";

type AuthCardProps = {
  title: string;
  description: string;
  footerText: string;
  footerLinkHref: string;
  footerLinkLabel: string;
  children: ReactNode;
};

export function AuthCard({
  title,
  description,
  footerText,
  footerLinkHref,
  footerLinkLabel,
  children,
}: AuthCardProps) {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(15,23,42,0.08),transparent_45%),linear-gradient(180deg,#fcfcf8_0%,#f5f1e8_100%)] px-6 py-10">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-6xl items-center justify-center">
        <div className="grid w-full gap-6 rounded-[2rem] border border-black/5 bg-white/80 p-4 shadow-[0_25px_80px_-45px_rgba(15,23,42,0.45)] backdrop-blur md:grid-cols-[1.1fr_0.9fr] md:p-6">
          <section className="hidden rounded-[1.5rem] bg-stone-950 p-8 text-stone-50 md:flex md:flex-col md:justify-between">
            <div className="space-y-4">
              <span className="inline-flex w-fit rounded-full border border-white/15 bg-white/10 px-3 py-1 text-sm">
                Evenos access
              </span>
              <h1 className="max-w-md text-4xl font-semibold tracking-tight">
                Use the real auth API to verify Evenos in the browser.
              </h1>
              <p className="max-w-md text-base leading-7 text-stone-300">
                Create an account with the backend connected to Neon, sign in,
                and land on the protected Evenos home screen.
              </p>
            </div>
            <div className="rounded-[1.25rem] border border-white/10 bg-white/5 p-5">
              <p className="text-sm leading-6 text-stone-300">
                If the backend is running and Neon is connected, this flow will
                persist your user in the database and return a real JWT token.
              </p>
            </div>
          </section>

          <Card className="border border-stone-200/80 bg-white py-0">
            <CardHeader className="border-b border-stone-200/80 py-6">
              <CardTitle className="text-2xl">{title}</CardTitle>
              <CardDescription>{description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 py-6">
              {children}
              <p className="text-sm text-stone-600">
                {footerText}{" "}
                <Link
                  href={footerLinkHref}
                  className="font-medium text-stone-950 underline decoration-stone-300 underline-offset-4"
                >
                  {footerLinkLabel}
                </Link>
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
