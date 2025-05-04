"use client";

import CheckoutButton from "@/components/CheckoutButton";
import Loading from "@/components/Loading";
import SubscriptionModel from "@/components/models/SubscriptionModel";
import { Button } from "@/components/ui/button";
import axios from "axios";
import { BadgeDollarSign } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useQuery } from "react-query";

export default function Page({ params }: { params: { courseId: string } }) {
  const { data, isLoading } = useQuery({
    queryKey: ["sub", "course", params.courseId],
    queryFn: async () => {
      const data = await axios
        .get(`/api/courses/${params.courseId}/get_student_course_data`)
        .then((res) => res.data);
      return data;
    },
  });

  if (isLoading) return <Loading className="h-[70vh]" />;

  return (
    <div className="flex flex-col-reverse md:flex-row gap-10 w-[96%] mx-auto mt-7">
      <div className="md:flex-[1.3] w-full">
        <div className="p-5 border shadow rounded-lg">
          <div className="w-full">
            <Image
              src={data?.course?.image!}
              alt={data?.course?.title!}
              height={800}
              width={800}
              className="rounded object-cover mx-auto"
            />
          </div>
        </div>
        <div className="border shadow mt-7 rounded-lg p-5">
          <h3 className="text-2xl font-semibold border-b-2 border-secondary w-fit mb-3">
            {data?.course?.title}
          </h3>
          <div
            className="html-content"
            dangerouslySetInnerHTML={{
              __html: data?.course?.description || "",
            }}
          />
        </div>
      </div>
      <div className="md:flex-[0.7] w-full">
        <div className="border border-gray-300 dark:border-gray-500 shadow-xl rounded-lg p-5 backdrop-blur-md bg-slate-100/20 dark:bg-slate-400/20 md:-mt-52 -mt-24">
          <div>
            <Image
              src={data?.course?.image!}
              alt={data?.course?.title!}
              height={700}
              width={700}
              className="rounded object-cover"
            />
          </div>
          <div className="flex items-center justify-center mt-3 mb-4">
            <h3 className="2xl:text-4xl lg:text-3xl md:text-2xl text-2xl sm:text-3xl font-semibold border-b-4 border-secondary w-fit mb-3">
              {data?.course?.title}
            </h3>
          </div>
          {/* Course Price */}

          {data?.session?.user ? (
            <>
              {!data?.isOwned ? (
                <>
                  <div className="flex items-center justify-center">
                    <div className="text-lg z-20">
                      <div className="bg-blue-500 text-white py-1 px-4 rounded-full flex items-center justify-center gap-2">
                        <span>{data?.course?.price?.toFixed(2)}</span>
                        <BadgeDollarSign size={18} className="text-white" />
                      </div>
                    </div>
                    <div className="text-lg z-10 -mr-7 bg-primary/60 text-white py-1 pl-7 pr-10 rounded-full">
                      جنيهًا
                    </div>
                  </div>
                  <CheckoutButton
                    courseId={params.courseId}
                    className="w-full text-xl mt-4"
                  />
                </>
              ) : (
                <Button className="w-full h-12 text-xl rounded-full">
                  كمل مذاكره
                </Button>
              )}
            </>
          ) : (
            <>
              <div className="flex items-center justify-center">
                <div className="text-lg z-20">
                  <div className="bg-blue-500 text-white py-1 px-4 rounded-full flex items-center justify-center gap-2">
                    <span>{data?.course?.price?.toFixed(2)}</span>
                    <BadgeDollarSign size={18} className="text-white" />
                  </div>
                </div>
                <div className="text-lg z-10 -mr-7 bg-secondary text-white py-1 pl-7 pr-10 rounded-full">
                  جنيهًا
                </div>
              </div>

              <Button asChild className="w-full h-12 text-xl rounded-full mt-3">
                <Link href="/sign-in">اشترك الان</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
