import React, { useState } from "react";

const PodcastBlock = ({ content, onChange, onUpload }) => {
  const [isUploading, setIsUploading] = useState(false);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check if it's an audio file
    if (!file.type.startsWith('audio/')) {
      alert('لطفاً یک فایل صوتی انتخاب کنید');
      return;
    }

    setIsUploading(true);
    try {
      const audioUrl = await onUpload(file);
      onChange({ ...content, url: audioUrl, isUploaded: true });
    } catch (error) {
      console.error('Audio upload failed:', error);
      alert('آپلود پادکست با خطا مواجه شد');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="podcast-block">
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          آپلود پادکست یا آدرس پادکست
        </label>
        
        {/* File upload input */}
        <div className="mb-3">
          <input
            type="file"
            accept="audio/*"
            onChange={handleFileUpload}
            disabled={isUploading}
            className="w-full p-2 border rounded"
          />
          {isUploading && <p className="text-sm text-blue-600 mt-1">در حال آپلود...</p>}
        </div>
        
        <p className="text-xs text-gray-500 mb-2">یا آدرس پادکست را وارد کنید:</p>
        
        <input
          type="text"
          value={content.url || ""}
          onChange={(e) => onChange({ ...content, url: e.target.value })}
          className="w-full p-2 border rounded"
          placeholder="https://example.com/podcast.mp3"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          عنوان پادکست (اختیاری)
        </label>
        <input
          type="text"
          value={content.title || ""}
          onChange={(e) => onChange({ ...content, title: e.target.value })}
          className="w-full p-2 border rounded"
          placeholder="عنوان پادکست"
        />
      </div>
    </div>
  );
};

export default PodcastBlock;