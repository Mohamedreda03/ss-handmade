import { isUserSub } from "@/actions/subsc/isUserSub";
import { redirect } from "next/navigation";

export default async function LessonLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { courseId: string; lessonId: string };
}) {
  const { isOwned, isUserAuth, isUserAdmin } = await isUserSub(
    params.lessonId,
    params.courseId
  );

  if (isOwned || isUserAdmin) {
    return children;
  } else {
    redirect(`/course/${params.courseId}`);
  }
}
