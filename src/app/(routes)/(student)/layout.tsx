import Footer from "@/components/Footer";
import Navbar from "@/components/navbar/Navbar";
import React from "react";

export default async function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar />
      <main className="mt-[80px]">{children}</main>
      <Footer />
    </>
  );
}
