"use client";

import { cn } from "@/lib/utils";
import { Bancks } from "@/utils/years_data";
import Image from "next/image";
import Link from "next/link";
import { Button } from "./ui/button";

export default function Banks() {
  return (
    <div className="w-full mb-10 max-w-screen-xl mx-auto px-5">
      {Bancks.map((bank) => (
        <Link
          href={`/year/${bank.year}`}
          key={bank.year}
          className={cn(
            "flex flex-col items-center justify-center mt-10 w-full relative group",
            {
              hidden: bank.year === "B1" || bank.year === "B2",
            }
          )}
        >
          <Image
            src={bank.image}
            alt={bank.name}
            height={400}
            width={1400}
            className="group-hover:scale-105 transition duration-200"
          />
          <Button className="lg:text-2xl rounded-full group-hover:scale-110 transition duration-200">
            الدخول الي بنك الاسئلة
          </Button>
        </Link>
      ))}
    </div>
  );
}
