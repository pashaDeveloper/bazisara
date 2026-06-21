# Admin Signup Export

این پوشه فایل‌های لازم سمت داشبورد برای ثبت‌نام Admin را دارد.

## مسیرهای مهم

- `src/pages/auth/signup`: صفحه و مراحل ثبت‌نام
- `src/services/auth/authApi.js`: درخواست `POST /admin/sign-up`
- `src/services/nab.js`: تنظیم RTK Query و `VITE_BASE_URL`
- `src/store.js` و `src/providers.jsx`: Redux setup مینیمال برای همین بخش
- `src/SignupRouteExample.jsx`: نمونه اتصال route
- `src/components`: کامپوننت‌ها و آیکن‌های مورد نیاز فرم
- `src/css`: استایل‌های لازم فرم
- `public/avatar` و `public/logo.png`: assetهای انتخاب آواتار و لوگو

## پکیج‌های لازم

در پروژه مقصد این dependencyها باید نصب باشند:

```bash
npm i @reduxjs/toolkit react-redux react-router-dom react-hook-form react-hot-toast prop-types
```

اگر Tailwind/Vite هنوز تنظیم نیست، فایل‌های `vite.config.js`, `tailwind.config.js`, و `postcss.config.cjs` هم داخل همین پوشه کپی شده‌اند.

## Env

در پروژه مقصد مقدار زیر را تنظیم کن:

```env
VITE_BASE_URL=http://localhost:8080/api
```

آدرس را با API واقعی پروژه مقصد جایگزین کن.
