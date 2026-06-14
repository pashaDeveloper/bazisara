import React, { useState } from "react";

const normalizeUploadedMedia = (media, fallbackType = "audio") => {
  if (typeof media === "string") {
    return { url: media, resource_type: fallbackType };
  }

  return {
    ...media,
    resource_type: media?.resource_type || fallbackType,
  };
};

const PodcastBlock = ({ content, onChange, onUpload, onDelete }) => {
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
      const uploadedAudio = normalizeUploadedMedia(await onUpload(file), "audio");
      onChange({
        ...content,
        url: uploadedAudio.url,
        media: uploadedAudio,
        isUploaded: true,
      });
    } catch (error) {
      console.error('Audio upload failed:', error);
      alert('آپلود پادکست با خطا مواجه شد');
    } finally {
      setIsUploading(false);
    }
  };

  const removePodcast = async () => {
    if (content.media?.public_id) {
      await onDelete?.(content.media);
    }

    onChange({
      ...content,
      url: "",
      media: null,
      isUploaded: false,
    });
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
          onChange={(e) => onChange({ ...content, url: e.target.value, media: null, isUploaded: false })}
          className="w-full p-2 border rounded"
          placeholder="https://example.com/podcast.mp3"
        />
        {content.isUploaded && content.url && (
          <button
            type="button"
            onClick={removePodcast}
            className="mt-2 px-3 py-1 bg-red-500 text-white rounded text-sm"
          >
            حذف پادکست از آروان
          </button>
        )}
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
