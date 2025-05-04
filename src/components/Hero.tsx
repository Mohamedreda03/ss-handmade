import Image from "next/image";
import Link from "next/link";

const Hero = () => {
  return (
    <div className="relative w-full bg-background overflow-hidden mt-[80px]">
      <div className="container mx-auto px-4 py-12 md:py-20">
        <div
          className="absolute inset-0 bg-repeat-x opacity-5"
          style={{
            backgroundImage: "url('/images/bg.jpg')",
            backgroundSize: "500px",
          }}
        />
        <div className="flex flex-col-reverse md:flex-row items-center gap-8">
          {/* القسم الأيمن: النص والأزرار */}
          <div className="w-full md:w-1/2 text-right z-10">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 text-primary-darker">
              اكتشف الصناعة اليدوية
              <br />و الحرف اليدوية و الدورات
            </h1>

            <p className="text-base md:text-lg text-muted-foreground mb-8 leading-relaxed">
              استكشف عالمًا من الحرف اليدوية الفريدة، وتعلم مهارات جديدة مع
              دوراتنا التدريبية التي يقدمها خبراؤنا. انضم إلينا للاحتفال
              بالإبداع والحرفية.
            </p>

            <div className="flex flex-wrap gap-4">
              <Link
                href="/products"
                className="bg-primary-darker/90 hover:bg-primary-darker text-white px-6 py-3 rounded-md font-medium transition-colors min-w-32 text-center"
              >
                تصفح المنتجات
              </Link>
              <Link
                href="/courses"
                className="bg-transparent border-2 border-primary-darker/80 hover:bg-primary/5 text-primary-darker px-6 py-3 rounded-md font-medium transition-colors min-w-32 text-center"
              >
                تصفح الدورات
              </Link>
            </div>
          </div>

          {/* القسم الأيسر: الصورة */}
          <div className="w-full md:w-1/2 relative z-10 h-[300px] md:h-[400px] overflow-hidden shadow-xl bg-secondary border-secondary border-t-[20px] border-r-[20px] rounded-[45px]">
            <Image
              src="/images/hero.avif"
              alt="الصناعة اليدوية"
              fill
              className="object-cover rounded-[40px]"
              priority
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
