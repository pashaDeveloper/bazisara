import React from "react";
import SkeletonImage from "@/components/shared/skeleton/SkeletonImage";
import ProfileImageSelector from "@/components/shared/gallery/ProfileImageSelector";
import NavigationButton from "@/components/shared/button/NavigationButton";

const AvatarStep = ({
  avatarPreview,
  handleImageSelect,
  nextStep,
  errors,
}) => {
  return (
    <>
      <div className="flex flex-col items-center">
        <div className="profile-container shine-effect rounded-full flex justify-center mb-4">
          {avatarPreview ? (
            <img
              src={avatarPreview}
              alt="avatar"
              height={100}
              width={100}
              className="h-[100px] w-[100px] profile-pic rounded-full"
            />
          ) : (
            <SkeletonImage />
          )}
        </div>
        <ProfileImageSelector onImageSelect={handleImageSelect} />
        {errors && (
          <span className="text-red-500 text-sm mt-2">
            {errors.message || "لطفاً عکس پروفایل خود را انتخاب کنید"}
          </span>
        )}
      </div>

      <div className="flex justify-start mt-12">
        <NavigationButton direction="next" onClick={nextStep} />
      </div>
    </>
  );
};

export default AvatarStep;
