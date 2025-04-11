"use client";

import { useParams } from "next/navigation";
import CheckoutCoursePage from "../page";

export default function CourseCheckout() {
  const params = useParams();

  return <CheckoutCoursePage />;
}
