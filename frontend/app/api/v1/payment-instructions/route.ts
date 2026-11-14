import { NextResponse } from 'next/server';

export async function GET() {
  const instructions = [
    {
      method: "MANUAL_TRANSFER",
      titleAr: "تحويل فودافون كاش / إنستاباي",
      descriptionAr: "يرجى تحويل إجمالي المبلغ إلى أحد الحسابات التالية، ثم إدخال رقم الهاتف المحول منه أو إرفاق صورة الإيصال لتأكيد الطلب فوراً.",
      fields: [
        {
          labelAr: "رقم محفظة فودافون كاش",
          value: "01069915609",
          copyable: true,
        },
        {
          labelAr: "عنوان الدفع إنستاباي (IPA)",
          value: "lolocupcakes@instapay",
          copyable: true,
        },
        {
          labelAr: "اسم المستلم",
          value: "Lolo Cupcakes",
          copyable: false,
        },
      ],
      proofUploadNote: "يرجى الاحتفاظ بصورة إيصال التحويل لإرفاقها وتأكيد الطلب بسرعة.",
    },
    {
      method: "CASH",
      titleAr: "الدفع عند الاستلام",
      descriptionAr: "يتم دفع كامل قيمة الطلب نقداً عند استلام الحلويات من مندوب التوصيل أو من الفرع.",
      fields: [],
      proofUploadNote: "",
    },
  ];

  return NextResponse.json({
    success: true,
    message: "Operation successful",
    data: instructions,
    timestamp: new Date().toISOString(),
  });
}
