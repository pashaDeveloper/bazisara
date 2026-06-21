import Modal from "@/components/shared/modal/Modal";
import Avatar from "./Avatar";
import React, { useState, useEffect } from "react";
import  CloudUpload  from "@/components/icons/CloudUpload";

const ProfileImageSelector = ({ onImageSelect }) => {
  const [showModal, setShowModal] = useState(false);
  const [isGeneral, setIsGeneral] = useState(true);
  const [avatarUrls, setAvatarUrls] = useState([]); 
  const [avatarPreview, setAvatarPreview] = useState(null);

  const maleAvatars = Array.from({ length: 50 }, (_, index) => `/avatar/male/${index + 1}.png`);
  const femaleAvatars = Array.from({ length: 50 }, (_, index) => `/avatar/female/${index + 51}.png`);

  const handleDeviceSelection = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setAvatarPreview(imageUrl); 
      onImageSelect(file);
      setShowModal(false);
    }
  };

  const handleGenderSelection = (gender) => {
    if (gender === "male") {
      setAvatarUrls(maleAvatars);
    } else if (gender === "female") {
      setAvatarUrls(femaleAvatars);
    }
  };

  useEffect(() => {
    handleGenderSelection("female"); 
  }, [showModal]);

  const handleAvatarClick = (url) => {
    setAvatarPreview(url); 
    onImageSelect(url);
    setShowModal(false);
  };

  return (
    <>

      <button
        type="button"
        onClick={() => setShowModal(true)}
        className="py-1 px-4 flex flex-row gap-x-2 dark:bg-blue-100 bg-green-100 border dark:text-blue-700 dark:border-blue-900 border-green-900 text-green-900 rounded-secondary w-fit text-sm"
      >
        <CloudUpload className="h-5 w-5 dark:!text-blue-700" />
        انتخاب عکس پروفایل*
      </button>

      <Modal
        isOpen={showModal}
        className={`lg:!w-1/3 md:!w-2/5`}
        onClose={() => setShowModal(false)}
      >
        <div className="flex flex-col p-2 gap-y-4 justify-center items-center">
          <label className="relative inline-flex cursor-pointer items-center">
            <input
              type="checkbox"
              checked={isGeneral}
              onChange={() => setIsGeneral(!isGeneral)}
              className="peer sr-only"
            />
            <div className="peer flex h-8 justify-center items-center gap-4 rounded-lg bg-orange-600 after:absolute after:left-1 after:h-6 after:w-[154px] after:rounded-lg after:bg-white/40 after:transition-all after:content-[''] peer-checked:bg-orange-600 peer-checked:after:translate-x-full peer-focus:outline-none text-sm ">
              <span className="mr-auto w-[150px] text-center text-white" onClick={() => handleGenderSelection("female")}>خانم</span>
              <span className="mr-auto w-[150px] text-center text-white" onClick={() => handleGenderSelection("male")}>آقا</span>
            </div>
          </label>
          
          <div className="flex flex-wrap gap-y-2 overflow-y-auto scrollbar-hide h-[250px]">
            {avatarUrls.map((url, index) => (
              <div key={index} className="w-1/3">
                <Avatar avatarUrl={url} onAvatarClick={() => handleAvatarClick(url)} />
              </div>
            ))}
          </div>
          
          {/* دکمه آپلود از دستگاه */}
          <label htmlFor="avatar" className="flex flex-col gap-y-2">
            <input
              type="file"
              name="avatar"
              id="avatar"
              accept="image/png, image/jpg, image/jpeg"
              className="hidden"
              onChange={handleDeviceSelection}
            />
            <span className="py-1 px-4 flex flex-row gap-x-2 dark:bg-blue-100 bg-green-100 border dark:text-blue-700 dark:border-blue-900 border-green-900 text-green-900 rounded-secondary w-fit text-sm cursor-pointer">
              <CloudUpload className="h-5 w-5 dark:!text-blue-700" />
              انتخاب از دستگاه
            </span>
          </label>
        </div>
      </Modal>
    </>
  );
};

export default ProfileImageSelector;
