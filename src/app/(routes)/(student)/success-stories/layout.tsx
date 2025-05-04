import PageTransition from "@/components/PageTransition";

export default function SuccessStoriesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-blue-50">
      <PageTransition>{children}</PageTransition>
    </div>
  );
}
