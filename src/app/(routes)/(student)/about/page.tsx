"use client";

import Image from "next/image";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  BookOpen,
  Heart,
  Users,
  MessageCircle,
  Star,
  Sparkles,
} from "lucide-react";

export default function AboutPage() {
  return (
    <div className="container mx-auto py-12 px-4 md:px-6">
      {/* عنوان الصفحة */}
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-primary mb-4">
          من نحن
        </h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          نحن فريق متحمس من الحرفيين والمبدعين الذين يسعون لنشر فن الأعمال
          اليدوية وتعليمها للجميع
        </p>
      </div>

      {/* قسم الرؤية والرسالة */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
        <Card className="p-8 border-2 border-primary/20 hover:border-primary/50 transition-all shadow-lg rounded-xl">
          <div className="flex items-center gap-4 mb-4">
            <div className="bg-primary/10 p-3 rounded-full">
              <Sparkles className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-2xl font-bold">رؤيتنا</h2>
          </div>
          <p className="text-lg text-muted-foreground leading-relaxed">
            نطمح أن نكون المنصة الرائدة عالمياً في تعليم وإلهام الحرفيين
            والفنانين، وخلق مجتمع إبداعي يُقدر ويُحيي الأعمال اليدوية التقليدية
            مع دمجها بالتقنيات الحديثة.
          </p>
        </Card>

        <Card className="p-8 border-2 border-primary/20 hover:border-primary/50 transition-all shadow-lg rounded-xl">
          <div className="flex items-center gap-4 mb-4">
            <div className="bg-primary/10 p-3 rounded-full">
              <Heart className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-2xl font-bold">رسالتنا</h2>
          </div>
          <p className="text-lg text-muted-foreground leading-relaxed">
            نسعى لتمكين الأفراد من جميع الخلفيات للتعبير عن إبداعهم من خلال
            الأعمال اليدوية، وتوفير منصة تعليمية متكاملة تجمع بين المعرفة
            النظرية والمهارات العملية في بيئة داعمة ومحفزة.
          </p>
        </Card>
      </div>

      {/* قسم قصتنا */}
      <div className="mb-16">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-4">قصتنا</h2>
          <Separator className="w-24 h-1 bg-primary mx-auto" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <p className="text-lg text-muted-foreground leading-relaxed mb-4">
              بدأت رحلتنا في عام 2020 كمبادرة صغيرة تهدف إلى جمع الحرفيين وتبادل
              المهارات والخبرات. مع مرور الوقت، تطورت الفكرة لتصبح منصة متكاملة
              للتعليم والتسويق في مجال الحرف اليدوية.
            </p>
            <p className="text-lg text-muted-foreground leading-relaxed mb-4">
              نؤمن بأن الأعمال اليدوية ليست مجرد هواية، بل هي تراث ثقافي وفني
              يستحق الاحتفاء به والحفاظ عليه. من خلال دوراتنا ومنتجاتنا، نسعى
              لإحياء الحرف التقليدية وتطويرها بما يتناسب مع العصر الحديث.
            </p>
            <p className="text-lg text-muted-foreground leading-relaxed">
              اليوم، أصبحنا مجتمعاً يضم آلاف المتعلمين والحرفيين من مختلف أنحاء
              الوطن العربي، يتشاركون الشغف والإبداع ويدعمون بعضهم البعض في رحلة
              التعلم والإنتاج.
            </p>
          </div>
          <div className="relative h-[400px] rounded-xl overflow-hidden shadow-xl">
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10"></div>
            <Image
              src="https://images.pexels.com/photos/6707628/pexels-photo-6707628.jpeg"
              alt="صورة فريق العمل"
              fill
              className="object-cover"
            />
          </div>
        </div>
      </div>

      {/* قسم قيمنا */}
      <div className="mb-16">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-4">قيمنا</h2>
          <Separator className="w-24 h-1 bg-primary mx-auto" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          <Card className="p-6 hover:shadow-lg transition-all">
            <div className="bg-primary/10 p-3 rounded-full w-fit mb-4">
              <Star className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-bold mb-2">الجودة والإتقان</h3>
            <p className="text-muted-foreground">
              نلتزم بتقديم محتوى تعليمي عالي الجودة ومنتجات متقنة تعكس قيمة
              العمل اليدوي الأصيل.
            </p>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-all">
            <div className="bg-primary/10 p-3 rounded-full w-fit mb-4">
              <Users className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-bold mb-2">المجتمع والتعاون</h3>
            <p className="text-muted-foreground">
              نؤمن بقوة المجتمع والتعاون المشترك، ونسعى لخلق بيئة داعمة يتبادل
              فيها الجميع الخبرات والأفكار.
            </p>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-all">
            <div className="bg-primary/10 p-3 rounded-full w-fit mb-4">
              <BookOpen className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-bold mb-2">التعلم المستمر</h3>
            <p className="text-muted-foreground">
              نشجع على التطور والتعلم المستمر، ونسعى دائماً لتجديد محتوانا
              ومواكبة أحدث التقنيات والأساليب.
            </p>
          </Card>
        </div>
      </div>

      {/* قسم التواصل */}
      <div className="bg-muted p-8 rounded-2xl">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-3">تواصل معنا</h2>
          <p className="text-lg text-muted-foreground">
            نحن دائماً سعداء بالتواصل معكم والإجابة عن استفساراتكم
          </p>
        </div>

        <div className="flex justify-center">
          <Card className="p-6 max-w-lg w-full">
            <div className="flex items-center gap-3 mb-4">
              <MessageCircle className="text-primary" />
              <h3 className="font-bold">أرسل لنا رسالة</h3>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="الاسم"
                  className="rounded-md border p-3 w-full focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <input
                  type="email"
                  placeholder="البريد الإلكتروني"
                  className="rounded-md border p-3 w-full focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <input
                type="text"
                placeholder="الموضوع"
                className="rounded-md border p-3 w-full focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <textarea
                placeholder="رسالتك"
                rows={4}
                className="rounded-md border p-3 w-full focus:outline-none focus:ring-2 focus:ring-primary"
              ></textarea>
              <button className="bg-primary text-white py-3 px-6 rounded-md w-full hover:bg-primary/90 transition-colors">
                إرسال الرسالة
              </button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
