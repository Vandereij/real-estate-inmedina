// app/layout.tsx
import Header from "@/components/header";
import Footer from "@/components/footer";
import "./globals.css";
import { createSupabaseServerClient } from "@/lib/auth";
import { GoogleTagManager } from "@next/third-parties/google";

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let isAdmin = false;
  if (user) {
    const { data } = await supabase.rpc("is_admin");
    isAdmin = !!data;
  }

  return (
    <html lang="en">
      <head>
        <GoogleTagManager gtmId={process.env.NEXT_PUBLIC_GTM_ID!} />
      </head>
      <body className="min-h-screen bg-background text-[#1e1e1e]">
        <main className="flex min-h-screen flex-col">
          <Header isAdmin={isAdmin} user={user} />
          <section className="flex-1">{children}</section>
          <Footer />
        </main>
      </body>
    </html>
  );
}
