import React, { useState } from "react";
import FormInput from "@/components/shared/input/FormInput";
import Plus from "@/components/icons/Plus";
import Minus from "@/components/icons/Minus";
import { useUploadMutation, useDeleteUploadMutation } from "@/services/upload/uploadApi";

const LinkBlock = ({ content, onChange }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [upload] = useUploadMutation();
  const [deleteUpload] = useDeleteUploadMutation();

  const handleAddLink = () => {
    const newLink = {
      id: Date.now(),
      image: null,
      title: "",
      description: "",
      url: "",
      color: "indigo" // default color
    };
    
    onChange({
      ...content,
      links: [...(content.links || []), newLink]
    });
  };

  const handleRemoveLink = async (index) => {
    try {
      const linkToRemove = content.links[index];
      
      // If the link has an image with a public_id, delete it from storage
      if (linkToRemove.image && linkToRemove.image.public_id) {
        await deleteUpload({ 
          public_id: linkToRemove.image.public_id,
          resource_type: linkToRemove.image.resource_type || 'image'
        }).unwrap();
      }
      
      // Remove from state
      const newLinks = [...(content.links || [])];
      newLinks.splice(index, 1);
      
      onChange({
        ...content,
        links: newLinks
      });
    } catch (error) {
      console.error("Error deleting image:", error);
      // Still remove from state even if deletion fails
      const newLinks = [...(content.links || [])];
      newLinks.splice(index, 1);
      
      onChange({
        ...content,
        links: newLinks
      });
    }
  };

  const handleLinkPropertyChange = (index, property, value) => {
    const newLinks = [...(content.links || [])];
    newLinks[index] = {
      ...newLinks[index],
      [property]: value
    };
    
    onChange({
      ...content,
      links: newLinks
    });
  };

  const handleColorChange = (index, color) => {
    const newLinks = [...(content.links || [])];
    newLinks[index] = {
      ...newLinks[index],
      color
    };
    
    onChange({
      ...content,
      links: newLinks
    });
  };

  const handleImageUpload = async (index, e) => {
    e.preventDefault();
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    setUploadError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      
      const result = await upload(formData).unwrap();
      
      // Update the link with the uploaded image
      const newLinks = [...(content.links || [])];
      newLinks[index] = {
        ...newLinks[index],
        image: {
          url: result.data.url,
          alt: "",
          public_id: result.data.public_id,
          resource_type: result.data.resource_type
        }
      };
      
      onChange({
        ...content,
        links: newLinks
      });
    } catch (error) {
      setUploadError("آپلود تصویر با خطا مواجه شد");
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveImage = async (index) => {
    try {
      const link = content.links[index];
      
      // If the image has a public_id, delete it from storage
      if (link.image && link.image.public_id) {
        await deleteUpload({ 
          public_id: link.image.public_id,
          resource_type: link.image.resource_type || 'image'
        }).unwrap();
      }
      
      // Remove image from link
      const newLinks = [...(content.links || [])];
      newLinks[index] = {
        ...newLinks[index],
        image: null
      };
      
      onChange({
        ...content,
        links: newLinks
      });
    } catch (error) {
      console.error("Error deleting image:", error);
      // Still remove from state even if deletion fails
      const newLinks = [...(content.links || [])];
      newLinks[index] = {
        ...newLinks[index],
        image: null
      };
      
      onChange({
        ...content,
        links: newLinks
      });
    }
  };

  return (
    <div className="link-block">
      <div className="mb-4">
        <button
          type="button"
          onClick={handleAddLink}
          className="flex items-center gap-2 px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          <Plus className="w-4 h-4" />
          <span>افزودن لینک</span>
        </button>
        
        {uploadError && <p className="text-red-500 mt-2">{uploadError}</p>}
        
        {/* Instructions */}
        <div className="mt-4 p-3 bg-yellow-50 rounded text-sm text-gray-700">
          <p className="font-bold mb-1">راهنمایی:</p>
          <p>اگر از افزودن مطلب منصرف شدید، حتماً تصاویر و رسانه‌ها را حذف کنید تا از ذخیره‌سازی غیرضروری جلوگیری شود.</p>
        </div>
      </div>

      {/* Display links */}
      {content.links && content.links.length > 0 && (
        <div className="space-y-4">
          {content.links.map((link, index) => (
            <div key={link.id || index} className="border rounded p-3 relative">
              <button
                type="button"
                onClick={() => handleRemoveLink(index)}
                className="absolute top-2 left-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
                title="حذف لینک"
              >
                <Minus className="w-4 h-4" />
              </button>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <FormInput
                  type="text"
                  label="عنوان"
                  value={link.title || ""}
                  onChange={(e) => handleLinkPropertyChange(index, 'title', e.target.value)}
                  placeholder="عنوان لینک"
                />
                
                <FormInput
                  type="text"
                  label="آدرس (URL)"
                  value={link.url || ""}
                  onChange={(e) => handleLinkPropertyChange(index, 'url', e.target.value)}
                  placeholder="https://example.com"
                />
              </div>
              
              <div className="mt-3">
                <label className="block mb-2">رنگ پس‌زمینه</label>
                <div className="flex gap-2 flex-wrap">
                  {[
                    { name: 'indigo', from: 'from-indigo-50', to: 'to-indigo-100', text: 'text-indigo-800' },
                    { name: 'blue', from: 'from-blue-50', to: 'to-blue-100', text: 'text-blue-800' },
                    { name: 'green', from: 'from-green-50', to: 'to-green-100', text: 'text-green-800' },
                    { name: 'red', from: 'from-red-50', to: 'to-red-100', text: 'text-red-800' },
                    { name: 'purple', from: 'from-purple-50', to: 'to-purple-100', text: 'text-purple-800' },
                    { name: 'yellow', from: 'from-yellow-50', to: 'to-yellow-100', text: 'text-yellow-800' }
                  ].map((colorOption) => (
                    <button
                      key={colorOption.name}
                      type="button"
                      className={`w-8 h-8 rounded-full bg-gradient-to-br ${colorOption.from} ${colorOption.to} border-2 ${link.color === colorOption.name ? 'border-gray-800' : 'border-gray-300'}`}
                      onClick={() => handleColorChange(index, colorOption.name)}
                      title={colorOption.name}
                    />
                  ))}
                </div>
              </div>
              
              <FormInput
                type="text"
                label="توضیحات"
                value={link.description || ""}
                onChange={(e) => handleLinkPropertyChange(index, 'description', e.target.value)}
                placeholder="توضیحات مختصر"
                className="mt-2"
              />
              
              <div className="mt-3">
                <label className="block mb-2">تصویر</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageUpload(index, e)}
                  disabled={isUploading}
                  className="block w-full text-sm text-gray-500
                    file:mr-4 file:py-2 file:px-4
                    file:rounded file:border-0
                    file:text-sm file:font-semibold
                    file:bg-blue-50 file:text-blue-700
                    hover:file:bg-blue-100"
                />
                {isUploading && <p className="text-blue-500 mt-2">در حال آپلود...</p>}
                
                {link.image && (
                  <div className="mt-2 relative w-16 h-16">
                    <img 
                      src={link.image.url} 
                      alt={link.image.alt || link.title} 
                      className="w-full h-full object-cover rounded"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(index)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center"
                      title="حذف تصویر"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LinkBlock;