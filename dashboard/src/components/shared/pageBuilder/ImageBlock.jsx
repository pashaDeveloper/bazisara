import React, { useState } from "react";
import FormInput from "@/components/shared/input/FormInput";
import Plus from "@/components/icons/Plus";
import Minus from "@/components/icons/Minus";
import { useUploadMutation, useDeleteUploadMutation } from "@/services/upload/uploadApi";

const ImageBlock = ({ content, onChange }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [upload] = useUploadMutation();
  const [deleteUpload] = useDeleteUploadMutation();

  const handleFileChange = async (e) => {
    e.preventDefault(); // Prevent form submission
    const files = Array.from(e.target.files);
    if (!files.length) return;

    setIsUploading(true);
    setUploadError(null);

    try {
      const uploadedImages = [];
      for (const file of files) {
        const formData = new FormData();
        formData.append("file", file);
        
        const result = await upload(formData).unwrap();
        uploadedImages.push({
          url: result.data.url,
          alt: "",
          caption: "",
          public_id: result.data.public_id,
          resource_type: result.data.resource_type
        });
      }
      
      // Add new images to existing images
      onChange({
        ...content,
        images: [...(content.images || []), ...uploadedImages]
      });
    } catch (error) {
      setUploadError("آپلود تصویر با خطا مواجه شد");
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveImage = async (index) => {
    try {
      const imageToRemove = content.images[index];
      
      // If the image has a public_id, delete it from storage
      if (imageToRemove.public_id) {
        await deleteUpload({ 
          public_id: imageToRemove.public_id,
          resource_type: imageToRemove.resource_type || 'image'
        }).unwrap();
      }
      
      // Remove from state
      const newImages = [...(content.images || [])];
      newImages.splice(index, 1);
      
      onChange({
        ...content,
        images: newImages
      });
    } catch (error) {
      console.error("Error deleting image:", error);
      // Still remove from state even if deletion fails
      const newImages = [...(content.images || [])];
      newImages.splice(index, 1);
      
      onChange({
        ...content,
        images: newImages
      });
    }
  };

  const handleImagePropertyChange = (index, property, value) => {
    const newImages = [...(content.images || [])];
    newImages[index] = {
      ...newImages[index],
      [property]: value
    };
    
    onChange({
      ...content,
      images: newImages
    });
  };

  return (
    <div className="image-block">
      <div className="mb-4">
        <label className="block mb-2">تصاویر (قابلیت انتخاب چندتایی)</label>
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          disabled={isUploading}
          multiple
          className="block w-full text-sm text-gray-500
            file:mr-4 file:py-2 file:px-4
            file:rounded file:border-0
            file:text-sm file:font-semibold
            file:bg-blue-50 file:text-blue-700
            hover:file:bg-blue-100"
        />
        {isUploading && <p className="text-blue-500 mt-2">در حال آپلود...</p>}
        {uploadError && <p className="text-red-500 mt-2">{uploadError}</p>
        }
      </div>
      
      <div className="mt-4 p-3 bg-yellow-50 rounded text-sm text-gray-700">
        <p className="font-bold mb-1">راهنمایی:</p>
        <p>اگر از افزودن مطلب منصرف شدید، حتماً تصاویر و رسانه‌ها را حذف کنید تا از ذخیره‌سازی غیرضروری جلوگیری شود.</p>
      </div>

      {/* Display uploaded images */}
      {content.images && content.images.length > 0 && (
        <div className="mb-4 grid grid-cols-2 gap-4">
          {content.images.map((image, index) => (
            <div key={index} className="relative border rounded p-2">
              <div className="relative">
                <img 
                  src={image.url} 
                  alt={image.alt} 
                  className="w-full h-auto rounded"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveImage(index)}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
                  title="حذف تصویر"
                >
                  <Minus className="w-4 h-4" />
                </button>
              </div>
              
              <FormInput
                type="text"
                label="متن جایگزین (Alt)"
                value={image.alt || ""}
                onChange={(e) => handleImagePropertyChange(index, 'alt', e.target.value)}
                placeholder="متن جایگزین تصویر"
                className="mt-2"
              />
              
              <FormInput
                type="text"
                label="توضیحات (Caption)"
                value={image.caption || ""}
                onChange={(e) => handleImagePropertyChange(index, 'caption', e.target.value)}
                placeholder="توضیحات تصویر"
                className="mt-2"
              />
            </div>
          ))}
        </div>
      )}
      
      {/* Block-level caption */}
      <FormInput
        type="text"
        label="توضیحات کلی (برای تمام تصاویر)"
        value={content.caption || ""}
        onChange={(e) => onChange({ ...content, caption: e.target.value })}
        placeholder="توضیحات کلی برای مجموعه تصاویر"
        className="mt-2"
      />
    </div>
  );
};

export default ImageBlock;