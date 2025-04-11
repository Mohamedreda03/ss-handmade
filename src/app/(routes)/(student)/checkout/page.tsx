"use client";

import { useCartStore } from "@/store/useCartStore";
import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Check, CreditCard, ShoppingBag, Tag, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import axios from "axios";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

// Definimos el tipo de ítem de carrito para distinguir entre productos y cursos
type ItemType = "product" | "course";

// Define el esquema de validación para el formulario de pago
const paymentFormSchema = z.object({
  // Campos de dirección de entrega
  fullName: z
    .string()
    .min(3, "يجب أن يحتوي الاسم على 3 أحرف على الأقل")
    .max(50, "الاسم طويل جدًا"),
  phoneNumber: z
    .string()
    .min(10, "رقم الهاتف يجب أن يحتوي على 10 أرقام على الأقل")
    .max(15, "رقم الهاتف غير صحيح")
    .regex(/^[0-9+]+$/, "رقم الهاتف يجب أن يحتوي على أرقام فقط"),
  address: z
    .string()
    .min(10, "يجب أن يحتوي العنوان على 10 أحرف على الأقل")
    .max(200, "العنوان طويل جدًا"),

  cardNumber: z
    .string()
    .min(16, "يجب أن يحتوي رقم البطاقة على 16 رقم على الأقل")
    .max(19, "رقم البطاقة غير صحيح")
    .regex(/^[0-9\s]+$/, "رقم البطاقة يجب أن يحتوي على أرقام فقط"),
  expiryDate: z
    .string()
    .regex(/^(0[1-9]|1[0-2])\/([0-9]{2})$/, "صيغة غير صحيحة، استخدم MM/YY")
    .refine(
      (value) => {
        const [month, year] = value.split("/");
        const now = new Date();
        const currentYear = now.getFullYear() % 100;
        const currentMonth = now.getMonth() + 1;
        const expYear = parseInt(year, 10);
        const expMonth = parseInt(month, 10);

        return (
          expYear > currentYear ||
          (expYear === currentYear && expMonth >= currentMonth)
        );
      },
      { message: "البطاقة منتهية الصلاحية" }
    ),
  cvv: z
    .string()
    .min(3, "CVV يجب أن يحتوي على 3 أرقام على الأقل")
    .max(4, "CVV يجب أن لا يزيد عن 4 أرقام")
    .regex(/^[0-9]+$/, "CVV يجب أن يحتوي على أرقام فقط"),
  cardholderName: z
    .string()
    .min(3, "اسم صاحب البطاقة يجب أن يحتوي على 3 أحرف على الأقل")
    .max(50, "اسم صاحب البطاقة طويل جدًا"),
});

type PaymentFormValues = z.infer<typeof paymentFormSchema>;

export default function CheckoutPage() {
  const router = useRouter();
  const { items, totalPrice, clearCart } = useCartStore();
  const [isLoading, setIsLoading] = useState(false);
  const [applyingCoupon, setApplyingCoupon] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [couponMessage, setCouponMessage] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [discount, setDiscount] = useState(0);
  const [couponId, setCouponId] = useState<string | null>(null);

  // Inicializar el formulario con react-hook-form y zod
  const form = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentFormSchema),
    defaultValues: {
      fullName: "",
      phoneNumber: "",
      address: "",

      cardNumber: "",
      expiryDate: "",
      cvv: "",
      cardholderName: "",
    },
  });

  // Función para determinar el tipo de cada ítem (producto o curso)
  const getItemType = (item: any): ItemType => {
    // Basado en la URL o estructura del ítem, podemos identificar si es curso o producto
    // Por ahora, asumimos que tienen un formato de URL distinto o algún identificador en el ID
    // Si el id del producto contiene 'course', es un curso, de lo contrario, es un producto
    return item.productId.includes("course") ? "course" : "product";
  };

  const handleCheckout = async (values: PaymentFormValues) => {
    try {
      setIsLoading(true);
      // Create a random invoice ID
      const invoice_id = Math.floor(Math.random() * 1000000).toString();
      const invoice_ref =
        "REF-" + Math.floor(Math.random() * 1000000).toString();

      // Calculate final price after discount
      const finalPrice = totalPrice - discount;

      // For real implementation, you would call your payment API here
      await axios.post("/api/payment", {
        amount: finalPrice,
        invoice_id,
        invoice_ref,
        items: items,
        couponId: couponId,
        // Añadir la información de dirección de entrega
        shippingAddress: {
          fullName: values.fullName,
          phoneNumber: values.phoneNumber,
          address: values.address,
        },
        paymentDetails: {
          cardNumber: values.cardNumber.replace(/\s/g, ""),
          expiryDate: values.expiryDate,
          cardholderName: values.cardholderName,
          // No enviar CVV por seguridad
        },
      });

      // After creating payment, redirect to success page
      await new Promise((resolve) => setTimeout(resolve, 1500)); // Simulate API call
      clearCart();
      router.push("/success-payment");
    } catch (error) {
      console.error("Payment error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;

    try {
      setApplyingCoupon(true);
      setCouponMessage(null);

      // Verificar los tipos de ítems en el carrito
      const hasProducts = items.some((item) => getItemType(item) === "product");
      const hasCourses = items.some((item) => getItemType(item) === "course");

      // Llamar a la API para validar el cupón
      const response = await axios.patch("/api/coupons", {
        code: couponCode,
        amount: totalPrice,
        validateOnly: true,
        itemTypes: { hasProducts, hasCourses }, // Enviar información sobre los tipos de ítems
      });

      if (response.data.success) {
        // Verificar si el cupón es válido para los ítems en el carrito
        const { couponType } = response.data;

        // Validar compatibilidad del cupón con el contenido del carrito
        if (couponType === "course" && !hasCourses) {
          setCouponMessage({
            type: "error",
            message: "هذا الكوبون صالح للكورسات فقط وليس للمنتجات",
          });
          setDiscount(0);
          setCouponId(null);
          return;
        }

        if (couponType === "product" && !hasProducts) {
          setCouponMessage({
            type: "error",
            message: "هذا الكوبون صالح للمنتجات فقط وليس للكورسات",
          });
          setDiscount(0);
          setCouponId(null);
          return;
        }

        // Si llegamos aquí, el cupón es válido para los elementos en el carrito
        setDiscount(response.data.discount);
        setCouponId(response.data.couponId);
        setCouponMessage({
          type: "success",
          message: response.data.message,
        });
      }
    } catch (error: any) {
      console.error("Apply coupon error:", error);
      setCouponMessage({
        type: "error",
        message: error.response?.data?.message || "حدث خطأ أثناء تطبيق الكوبون",
      });
      setDiscount(0);
      setCouponId(null);
    } finally {
      setApplyingCoupon(false);
    }
  };

  // Format card number with spaces
  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || "";
    const parts = [];

    for (let i = 0; i < match.length; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    if (parts.length) {
      return parts.join(" ");
    }

    return value;
  };

  // Format expiry date as MM/YY
  const formatExpiryDate = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");

    if (v.length >= 3) {
      return `${v.substring(0, 2)}/${v.substring(2, 4)}`;
    }

    return value;
  };

  // Calculate final price after discount
  const finalPrice = totalPrice - discount;

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-6xl mx-auto px-4 py-10">
          <h1 className="text-3xl font-bold text-center mb-8 border-b pb-4 border-gray-200">
            إتمام عملية الشراء
          </h1>
          <div className="text-center py-12">
            <h2 className="text-2xl font-medium mb-4">سلة التسوق فارغة</h2>
            <p className="mb-6 text-muted-foreground">
              قم بإضافة بعض المنتجات قبل إتمام عملية الشراء
            </p>
            <Button
              onClick={() => router.push("/")}
              className="bg-black hover:bg-gray-800 text-white"
            >
              العودة للتسوق
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold text-center mb-8 border-b pb-4 border-gray-200">
          إتمام عملية الشراء
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {/* Products Information */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-6 border-b pb-3">
              <ShoppingBag className="inline-block mr-2 h-5 w-5" /> معلومات
              المنتجات
            </h2>

            <div className="space-y-4">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-start gap-4 pb-4 border-b border-gray-100 last:border-0"
                >
                  {item.imageUrl && (
                    <div className="relative w-28 h-28">
                      <Image
                        src={item.imageUrl}
                        fill
                        alt={item.name}
                        className="rounded-md object-cover"
                      />
                    </div>
                  )}

                  <div className="flex-1">
                    <h3 className="text-lg font-medium">{item.name}</h3>
                    <p className="text-gray-600 text-sm">
                      الكمية: {item.quantity}
                    </p>
                    <p className="text-gray-800 font-medium mt-1">
                      {item.price} جنيه × {item.quantity}
                    </p>
                  </div>
                  <div className="font-bold">
                    {(item.price * item.quantity).toFixed(2)} جنيه
                  </div>
                </div>
              ))}
            </div>

            {/* Coupon Code Input */}
            <div className="mt-6 mb-4">
              <h3 className="text-md font-semibold mb-2 flex items-center">
                <Tag size={18} className="ml-1" />
                هل لديك كوبون خصم؟
              </h3>
              <div className="flex gap-2">
                <Input
                  placeholder="أدخل كود الخصم"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  className="text-right flex-1"
                  disabled={applyingCoupon}
                />
                <Button
                  onClick={handleApplyCoupon}
                  disabled={applyingCoupon || !couponCode.trim()}
                  variant="outline"
                >
                  {applyingCoupon ? "جاري التطبيق..." : "تطبيق"}
                </Button>
              </div>

              {couponMessage && (
                <Alert
                  className={`mt-2 ${
                    couponMessage.type === "success"
                      ? "bg-green-50 border-green-200 text-green-700"
                      : "bg-red-50 border-red-200 text-red-700"
                  }`}
                >
                  <AlertCircle className="h-4 w-4 ml-2" />
                  <AlertDescription>{couponMessage.message}</AlertDescription>
                </Alert>
              )}
            </div>

            <div className="mt-6">
              <div className="flex items-center justify-between py-2 border-t border-gray-100">
                <span className="text-gray-600">المجموع الفرعي</span>
                <span className="font-semibold">
                  {totalPrice.toFixed(2)} جنيه
                </span>
              </div>

              {discount > 0 && (
                <div className="flex items-center justify-between py-2 border-t border-gray-100">
                  <span className="text-green-600">الخصم</span>
                  <span className="font-semibold text-green-600">
                    - {discount.toFixed(2)} جنيه
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between py-2 border-t border-gray-100">
                <span className="text-gray-600">الضريبة</span>
                <span className="font-semibold">0 جنيه</span>
              </div>

              <div className="flex items-center justify بين py-2 border-t border-gray-100">
                <span className="font-medium text-lg">الإجمالي</span>
                <span className="font-bold text-lg">
                  {finalPrice.toFixed(2)} جنيه
                  {discount > 0 && (
                    <span className="text-sm text-gray-500 line-through mr-2">
                      {totalPrice.toFixed(2)} جنيه
                    </span>
                  )}
                </span>
              </div>
            </div>
          </div>

          {/* Payment Options */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-6 border-b pb-3">
              اختر وسيلة الدفع
            </h2>

            <div className="space-y-4">
              {/* Credit Card Option */}
              <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                <div className="flex items-center gap-3">
                  <div className="rounded-full h-6 w-6 flex items-center justify-center border-2 border-black">
                    <Check size={14} className="text-black" />
                  </div>
                  <CreditCard className="h-6 w-6 text-gray-800" />
                  <span className="font-medium">الدفع بالبطاقة البنكية</span>
                </div>

                <div className="mt-6 space-y-4">
                  {/* Credit Card Form using shadcn/ui Form */}
                  <Form {...form}>
                    <form
                      onSubmit={form.handleSubmit(handleCheckout)}
                      className="space-y-4"
                    >
                      {/* Sección de dirección de entrega */}
                      <h3 className="text-lg font-semibold mb-2">
                        عنوان التوصيل
                      </h3>
                      <div className="bg-white p-4 rounded-md border border-gray-200 mb-4">
                        <FormField
                          control={form.control}
                          name="fullName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="block text-sm font-medium text-gray-700 mb-1">
                                الاسم الكامل
                              </FormLabel>
                              <FormControl>
                                <Input
                                  type="text"
                                  placeholder="أدخل الاسم الكامل"
                                  className="w-full px-3 py-2"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="phoneNumber"
                          render={({ field }) => (
                            <FormItem className="mt-3">
                              <FormLabel className="block text-sm font-medium text-gray-700 mb-1">
                                رقم الهاتف
                              </FormLabel>
                              <FormControl>
                                <Input
                                  type="text"
                                  placeholder="أدخل رقم الهاتف"
                                  className="w-full px-3 py-2"
                                  dir="ltr"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="address"
                          render={({ field }) => (
                            <FormItem className="mt-3">
                              <FormLabel className="block text-sm font-medium text-gray-700 mb-1">
                                العنوان التفصيلي
                              </FormLabel>
                              <FormControl>
                                <Input
                                  type="text"
                                  placeholder="أدخل العنوان التفصيلي (الشارع، المبنى، الرقم، الطابق)"
                                  className="w-full px-3 py-2"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      {/* Sección de información de pago */}
                      <h3 className="text-lg font-semibold mb-2">
                        بيانات البطاقة
                      </h3>
                      <FormField
                        control={form.control}
                        name="cardNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="block text-sm font-medium text-gray-700 mb-1">
                              رقم البطاقة
                            </FormLabel>
                            <FormControl>
                              <Input
                                type="text"
                                placeholder="XXXX XXXX XXXX XXXX"
                                className="w-full px-3 py-2 text-right"
                                dir="ltr"
                                {...field}
                                value={formatCardNumber(field.value)}
                                onChange={(e) => {
                                  field.onChange(
                                    formatCardNumber(e.target.value)
                                  );
                                }}
                                maxLength={19}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="expiryDate"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="block text-sm font-medium text-gray-700 mb-1">
                                تاريخ الانتهاء
                              </FormLabel>
                              <FormControl>
                                <Input
                                  type="text"
                                  placeholder="MM/YY"
                                  className="w-full px-3 py-2 text-right"
                                  dir="ltr"
                                  {...field}
                                  value={field.value}
                                  onChange={(e) => {
                                    const value = e.target.value.replace(
                                      /\D/g,
                                      ""
                                    );
                                    if (value.length <= 4) {
                                      const formatted =
                                        value.length >= 3
                                          ? `${value.substring(
                                              0,
                                              2
                                            )}/${value.substring(2)}`
                                          : value;
                                      field.onChange(formatted);
                                    }
                                  }}
                                  maxLength={5}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="cvv"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="block text-sm font-medium text-gray-700 mb-1">
                                رمز الأمان
                              </FormLabel>
                              <FormControl>
                                <Input
                                  type="text"
                                  placeholder="CVV"
                                  className="w-full px-3 py-2 text-right"
                                  dir="ltr"
                                  {...field}
                                  onChange={(e) => {
                                    const value = e.target.value.replace(
                                      /\D/g,
                                      ""
                                    );
                                    if (value.length <= 4) {
                                      field.onChange(value);
                                    }
                                  }}
                                  maxLength={4}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="cardholderName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="block text-sm font-medium text-gray-700 mb-1">
                              اسم صاحب البطاقة
                            </FormLabel>
                            <FormControl>
                              <Input
                                type="text"
                                placeholder="الاسم كما هو على البطاقة"
                                className="w-full px-3 py-2"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <Button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-3 bg-black hover:bg-gray-800 text-white font-medium rounded-md transition-colors mt-6"
                      >
                        {isLoading
                          ? "جاري المعالجة..."
                          : `إتمام الدفع - ${finalPrice.toFixed(2)} جنيه`}
                      </Button>
                    </form>
                  </Form>
                </div>
              </div>

              <p className="text-sm text-gray-500 text-center mt-4">
                بالضغط على زر إتمام الدفع، أنت توافق على شروط الخدمة وسياسة
                الخصوصية
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
