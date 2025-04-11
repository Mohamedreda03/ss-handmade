import Link from "next/link";
import Image from "next/image";

import MobileMenu from "./MobileMenu";
import AuthMenu from "../AuthMenu";
import { auth } from "@/auth";
import { Button } from "../ui/button";
import CartButton from "../products/CartButton";
import NavLinks from "./NavLinks";

export default async function Navbar() {
  const session = await auth();

  return (
    <header className="fixed top-0 left-0 right-0 border-b border-secondary z-[1000] bg-white shadow-sm w-full">
      <div className="relative flex">
        <div className="max-w-screen-2xl mx-auto px-7 h-[90px] flex items-center w-full">
          <nav className="flex items-center justify-between py-4 w-full relative">
            {!session && (
              <div className="">
                <div className="md:flex items-center gap-3 md:gap-5 hidden text-sm">
                  <Button
                    asChild
                    variant="destructive"
                    className="rounded-full px-5"
                  >
                    <Link href="/sign-up">انشاء حساب الان!</Link>
                  </Button>
                  <Button asChild className="rounded-full px-5">
                    <Link href="/sign-in">تسجيل الدخول</Link>
                  </Button>
                  <CartButton />
                </div>
                <MobileMenu />
              </div>
            )}

            <div className="flex items-center gap-5 w-full">
              {session && (
                <div className="md:max-w-[300px] w-full">
                  <div className="flex items-center gap-4">
                    <AuthMenu session={session} />

                    <CartButton />
                  </div>
                </div>
              )}

              <NavLinks />
            </div>

            <Link
              href="/"
              className="flex items-center justify-end md:max-w-[300px] w-full"
            >
              {/* <Image src="/img/pp2.png" width={100} height={100} alt="logo" /> */}
              <h1 className="text-3xl font-bold text-primary">
                Hand<span className="text-orange-500">Made</span>
              </h1>
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
