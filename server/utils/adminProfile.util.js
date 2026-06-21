const profileLevelRequirements = {
  1: ["avatar", "name", "fatherName", "email", "phone"],
  2: ["nationalCode", "birthDate", "gender", "nationalCard", "province", "city", "address", "plateNumber", "postalCode"],
  3: ["biography"],
};

function isFilled(value) {
  return String(value ?? "").trim().length > 0;
}

function fieldCompleted(admin = {}, field) {
  if (field === "avatar") return Boolean(admin?.avatar?.url && !String(admin.avatar.url).includes("placehold.co"));
  if (field === "nationalCard") return Boolean(admin?.nationalCard?.url);
  if (field === "birthDate") return Boolean(admin?.birthDate);
  if (["province", "city", "address", "plateNumber", "postalCode"].includes(field)) {
    return isFilled(admin?.address?.[field]);
  }
  return isFilled(admin?.[field]);
}

function getLevelCompletion(admin = {}, level) {
  const fields = profileLevelRequirements[level] || [];
  const completedCount = fields.filter((field) => fieldCompleted(admin, field)).length;
  return {
    completed: completedCount === fields.length,
    completedCount,
    total: fields.length,
    fields,
  };
}

function getHighestCompletedLevel(admin = {}) {
  let completedLevel = 0;
  for (const level of [1, 2, 3]) {
    if (!getLevelCompletion(admin, level).completed) break;
    completedLevel = level;
  }
  return completedLevel;
}

function normalizeApproval(admin = {}) {
  const approval = admin.profileApproval || {};
  return {
    approvedLevel: Number(approval.approvedLevel || 0),
    pendingLevel: Number(approval.pendingLevel || 0),
    approvedLevels: {
      level1: Boolean(approval.approvedLevels?.level1),
      level2: Boolean(approval.approvedLevels?.level2),
      level3: Boolean(approval.approvedLevels?.level3),
    },
    approvedAt: approval.approvedAt || null,
    approvedBy: approval.approvedBy || null,
  };
}

function getAdminProfileCompletion(admin = {}) {
  const levels = {
    1: getLevelCompletion(admin, 1),
    2: getLevelCompletion(admin, 2),
    3: getLevelCompletion(admin, 3),
  };
  const completedCount = levels[1].completedCount + levels[2].completedCount + levels[3].completedCount;
  const total = levels[1].total + levels[2].total + levels[3].total;
  const approval = normalizeApproval(admin);

  return {
    level: approval.approvedLevel,
    approvedLevel: approval.approvedLevel,
    pendingLevel: approval.pendingLevel,
    completedLevel: getHighestCompletedLevel(admin),
    percent: total ? Math.round((completedCount / total) * 100) : 0,
    completedCount,
    total,
    levels,
    profileApproval: approval,
  };
}

function getAdminProfileSnapshot(admin = {}) {
  const completion = getAdminProfileCompletion(admin);
  const levelMeta =
    completion.approvedLevel === 3
      ? {
          title: "سطح سه",
          description: "هر سه سطح پروفایل توسط مدیر کل تایید شده است.",
          nextAction: "پروفایل کامل است",
        }
      : completion.pendingLevel > completion.approvedLevel
        ? {
            title: `در انتظار تایید سطح ${completion.pendingLevel}`,
            description: "اطلاعات این سطح ذخیره شده و منتظر تایید مدیر کل است.",
            nextAction: "پس از تایید، سطح بعدی فعال می‌شود",
          }
        : {
            title: completion.approvedLevel ? `سطح ${completion.approvedLevel}` : "بدون سطح تایید شده",
            description: "برای ارتقا، اطلاعات سطح بعدی را کامل و ذخیره کنید تا برای مدیر کل ارسال شود.",
            nextAction: "تکمیل سطح بعدی",
          };

  return {
    ...completion,
    ...levelMeta,
  };
}

module.exports = {
  profileLevelRequirements,
  getAdminProfileCompletion,
  getAdminProfileSnapshot,
  getLevelCompletion,
};
