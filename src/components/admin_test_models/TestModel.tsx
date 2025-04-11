"use client";

export default function TestModel({
  children,
  isOpen,
}: {
  children: React.ReactNode;
  isOpen: boolean;
}) {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="bg-black/45 fixed inset-0 z-50 flex items-center justify-center">
      <div className="max-w-screen-lg h-full w-full overflow-y-auto bg-white dark:bg-dark_background rounded-lg shadow-lg px-4 py-10">
        {children}
      </div>
    </div>
  );
}
