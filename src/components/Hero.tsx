import Image from "next/image";
import Link from "next/link";

const Hero = () => {
  return (
    <div className="relative h-[600px] w-full">
      <div className="relative z-10 flex h-full w-full flex-col items-center justify-center text-center px-4">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
          اكتشف الصناعة اليدوية{" "}
          <span className="text-primary">الحرف اليدوية</span> و{" "}
          <span className="text-primary">الدورات</span>
        </h1>
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl">
          استكشف عالمًا من الحرف اليدوية الفريدة، وتعلم مهارات جديدة مع دوراتنا
          التدريبية التي يقدمها خبراؤنا. انضم إلينا للاحتفال بالإبداع والحرفية.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            href="/products"
            className="bg-primary hover:bg-primary/90 text-white px-8 py-3 rounded-md font-medium transition"
          >
            تصفح المنتجات
          </Link>
          <Link
            href="/course"
            className="bg-white hover:bg-gray-100 text-primary px-8 py-3 rounded-md font-medium transition"
          >
            تصفح الدورات
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Hero;
