export const metadata = {
  title: "سلة التسوق | متجر الصناعات اليدوية",
  description:
    "تصفح سلة التسوق الخاصة بك ومتابعة الدفع من متجر الصناعات اليدوية",
};

export default function CartLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-[calc(100vh-4rem)] bg-background">{children}</div>
  );
}
