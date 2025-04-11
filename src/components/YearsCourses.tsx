import Image from "next/image";
import Link from "next/link";
import { Years } from "@/utils/years_data";
import { cn } from "@/lib/utils";

export default function YearsCourses() {
  return (
    <div className="px-5 py-10 mx-auto max-w-screen-2xl mb-10 flex flex-col gap-10">
      <div className="flex items-center justify-center mb-5">
        <h2
          className={cn(
            "text-5xl border-b-2 border-fourth text-first text-center"
          )}
        >
          اختر سنتك الدراسية
        </h2>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-5 gap-y-20">
        {Years.map((year) => (
          <div
            key={year.year}
            className="hover:-translate-y-4 hover:scale-105 transition duration-300"
          >
            <Link href={`/year/${year.year}`}>
              <Image
                src={year.image}
                alt={year.name}
                height={300}
                width={800}
                className="rounded object-cover"
              />
              <div className="flex items-center justify-center -mt-[70px] md:-mt-[63px] xl:-mt-[85px]">
                <h3 className="text-3xl md:text-2xl xl:text-4xl text-white font-semibold cursor-pointer hover:scale-110 transition-all">
                  {year.name}
                </h3>
              </div>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
