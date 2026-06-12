const completionFields = [
  "name",
  "email",
  "phone",
  "nationalCode",
  "position",
  "department",
  "gender",
  "birthDate",
  "landline",
  "emergencyPhone",
  "province",
  "city",
  "address",
  "plateNumber",
  "unit",
  "postalCode",
  "biography",
];

function isFilled(value) {
  return String(value ?? "").trim().length > 0;
}

function getAdminProfileCompletion(admin = {}) {
  const address = admin?.address && typeof admin.address === "object" ? admin.address : {};
  const values = {
    ...admin,
    province: address.province || "",
    city: address.city || "",
    address: address.address || "",
    plateNumber: address.plateNumber || "",
    unit: address.unit || "",
    postalCode: address.postalCode || "",
  };

  const avatarCompleted = Boolean(admin?.avatar?.url);
  const completedCount =
    completionFields.filter((field) => isFilled(values[field])).length + (avatarCompleted ? 1 : 0);
  const total = completionFields.length + 1;
  const percent = Math.round((completedCount / total) * 100);

  let level = 1;
  if (percent >= 90) level = 3;
  else if (percent >= 50) level = 2;

  return {
    level,
    percent,
    completedCount,
    total,
  };
}

function getAdminProfileSnapshot(admin = {}) {
  const completion = getAdminProfileCompletion(admin);
  const levelMeta =
    completion.level === 3
      ? {
          title: "سطح سه",
          description: "پروفایل کامل است و دسترسی به محتوای حساس فعال می‌شود.",
          nextAction: "آماده تایید محتوا و انتشار",
        }
      : completion.level === 2
        ? {
            title: "سطح دو",
            description: "برای ساخت دسته‌بندی، آیکون، فیلتر و داده‌های پایه مناسب است.",
            nextAction: "برای سطح سه، اطلاعات هویتی و آدرس را کامل کنید",
          }
        : {
            title: "سطح یک",
            description: "فقط اطلاعات پایه کامل است و هنوز برای ساخت محتوای مهم کافی نیست.",
            nextAction: "نام، تماس، هویت و آدرس را تکمیل کنید",
          };

  return {
    ...completion,
    ...levelMeta,
  };
}

module.exports = {
  completionFields,
  getAdminProfileCompletion,
  getAdminProfileSnapshot,
};
