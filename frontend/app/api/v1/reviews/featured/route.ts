export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { NextResponse } from 'next/server';

export async function GET() {
  const sampleReviews = [
    {
      id: "rev-1",
      customerName: "سارة محمود",
      rating: 5,
      comment: "أحلى كب كيك ذقته في مصر! الكريمة خفيفة جداً ومظبوطة بالسكر، والتوصيل وصل في ميعاده بالضبط.",
      createdAt: new Date().toISOString(),
      featured: true,
      verifiedPurchase: true,
      productName: "كب كيك الكراميل",
    },
    {
      id: "rev-2",
      customerName: "أحمد عبد الله",
      rating: 5,
      comment: "تورتة الكيندر فادج عملت قلبان في عيد ميلاد ابني! طعم الشوكولاتة غني جداً وشكلها كان تحفة فنية.",
      createdAt: new Date().toISOString(),
      featured: true,
      verifiedPurchase: true,
      productName: "تورتة شوكولاتة كيندر فادج الملكية",
    },
    {
      id: "rev-3",
      customerName: "مريم إبراهيم",
      rating: 5,
      comment: "خدمة التخصيص ممتازة وفريق العمل متعاون جداً، النكهة طازة والشغل راقي يشرف في أي عزومة.",
      createdAt: new Date().toISOString(),
      featured: true,
      verifiedPurchase: true,
      productName: "بوكس كب كيك مشكل 6 قطع",
    }
  ];

  return NextResponse.json({
    success: true,
    message: "Operation successful",
    data: sampleReviews,
    timestamp: new Date().toISOString(),
  });
}
