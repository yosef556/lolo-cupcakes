# 🧁 دليل تشغيل موقع لولو كب كيك سحابياً 24/7 مجاناً بالكامل 100%
*(Lolo Cupcakes - Free 24/7 Cloud Hosting Guide)*

تم تجهيز هذا المشروع هندسياً ليعمل في السحابة على مدار الساعة وطوال أيام الأسبوع بدون الحاجة إلى تشغيل جهازك الشخصي، وبدون دفع أي مليم (0.00\$ مدى الحياة).

---

## 🏗️ الهيكل السحابي المجهز (Cloud Architecture):
* **الواجهة الأمامية (Frontend):** Next.js 14 على شبكة **Vercel Global Edge CDN** (سريعة جداً ومحمية بشهادة SSL تلقائياً).
* **السيرفر الخلفي (Backend):** Spring Boot (Java 21) يعمل كحاوية Docker على منصة **Render** السحابية.
* **قاعدة البيانات (Database):** PostgreSQL سحابية مجانية مؤمنة مع تشغيل الهجرات التلقائية (Flyway).

---

## 🚀 خطوات الإطلاق السحابي في 3 دقائق:

### 1️⃣ الخطوة الأولى: إنشاء المستودع على GitHub (تستغرق 10 ثوانٍ)
1. افتح الرابط التالي: [https://github.com/new](https://github.com/new)
2. اكتب في خانة **Repository name**: `lolo-cupcakes`
3. تأكد أنه **Public** أو **Private** (حسب رغبتك) واضغط زر **Create repository**.
4. من مجلد المشروع في جهازك، قم بتشغيل سكريبت الرفع الآلي:
   ```bash
   ./scripts/deploy.sh
   ```
   *(سيتم رفع الكود تلقائياً لأن جهازك موثق مسبقاً بمفتاح SSH لحسابك `yosef556`)*.

---

### 2️⃣ الخطوة الثانية: تشغيل السيرفر والداتابيز على Render (تستغرق دقيقة واحدة)
1. ادخل إلى: [https://dashboard.render.com](https://dashboard.render.com) وسجل دخولك بـ **GitHub** (مجاناً 100%).
2. اضغط على الزر الأزرق **New +** ثم اختر **Blueprint**.
3. اختر مستودع `lolo-cupcakes`.
4. سيقرأ Render ملف `render.yaml` المرفق تلقائياً ويقوم بتشغيل:
   * قاعدة بيانات PostgreSQL (`lolo-cupcakes-db`).
   * سيرفر Spring Boot (`lolo-cupcakes-backend`).
5. اضغط **Apply** وانتظر دقيقتين حتى يكتمل البناء.
6. انسخ رابط السيرفر المباشر الذي سيظهر لك (مثال: `https://lolo-cupcakes-backend.onrender.com`).

---

### 3️⃣ الخطوة الثالثة: تشغيل واجهة الموقع على Vercel (تستغرق دقيقة واحدة)
1. ادخل إلى: [https://vercel.com](https://vercel.com) وسجل دخولك بـ **GitHub** (مجاناً 100%).
2. اضغط **Add New...** ثم **Project**.
3. اختر مستودع `lolo-cupcakes` واضغط **Import**.
4. اضغط على **Edit** بجانب **Root Directory** واختر مجلد: `frontend`.
5. في قسم **Environment Variables**، أضف المتغير التالي:
   * **Key:** `NEXT_PUBLIC_API_URL`
   * **Value:** رابط الباك إند من الخطوة السابقة متبوعاً بـ `/api/v1`  
     *(مثال: `https://lolo-cupcakes-backend.onrender.com/api/v1`)*
6. اضغط **Deploy**.

---

### 🎉 النتيجة:
* ستحصل على رابط عالمي دائم مثل:  
  👉 `https://lolo-cupcakes.vercel.app`
* **الموقع شغال 24 ساعة في اليوم** حتى لو أغلقت جهازك والكهرباء والإنترنت انقطعت تماماً.
* يفتح بسلاسة من هواتف وأجهزة أي شخص في العالم بتوافق كامل مع الموبايل والدارك مود.
