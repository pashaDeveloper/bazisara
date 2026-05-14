import React, { useState, useRef } from "react";

const VideoBlock = ({ content, onChange, onUpload }) => {
  const [isUploading, setIsUploading] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check if it's a video file
    if (!file.type.startsWith('video/')) {
      alert('لطفاً یک فایل ویدئویی انتخاب کنید');
      return;
    }

    setIsUploading(true);
    try {
      const videoUrl = await onUpload(file);
      onChange({ ...content, url: videoUrl, isUploaded: true });
    } catch (error) {
      console.error('Video upload failed:', error);
      alert('آپلود ویدئو با خطا مواجه شد');
    } finally {
      setIsUploading(false);
    }
  };

  const handleThumbnailUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check if it's an image file
    if (!file.type.startsWith('image/')) {
      alert('لطفاً یک فایل تصویری انتخاب کنید');
      return;
    }

    setIsUploading(true);
    try {
      const thumbnailUrl = await onUpload(file);
      onChange({ ...content, thumbnail: thumbnailUrl, isThumbnailUploaded: true });
    } catch (error) {
      console.error('Thumbnail upload failed:', error);
      alert('آپلود تصویر بندانگشتی با خطا مواجه شد');
    } finally {
      setIsUploading(false);
    }
  };

  const removeThumbnail = () => {
    onChange({ ...content, thumbnail: "", isThumbnailUploaded: false });
  };

  // Capture thumbnail from video at current playback position
  const captureThumbnailFromVideo = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    // Check if video is loaded and has dimensions
    if (video.videoWidth === 0 || video.videoHeight === 0) {
      alert('لطفاً صبر کنید تا ویدئو بارگذاری شود');
      return;
    }

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw current video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Convert to blob and upload
    canvas.toBlob(async (blob) => {
      if (!blob) return;
      
      // Create a file from the blob
      const file = new File([blob], 'thumbnail.png', { type: 'image/png' });
      
      setIsUploading(true);
      try {
        const thumbnailUrl = await onUpload(file);
        onChange({ ...content, thumbnail: thumbnailUrl, isThumbnailUploaded: true });
      } catch (error) {
        console.error('Thumbnail capture failed:', error);
        alert('ضبط تصویر بندانگشتی با خطا مواجه شد');
      } finally {
        setIsUploading(false);
      }
    }, 'image/png');
  };

  return (
    <div className="video-block">
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          آپلود ویدئو یا آدرس ویدئو
        </label>
        
        {/* File upload input */}
        <div className="mb-3">
          <input
            type="file"
            accept="video/*"
            onChange={handleFileUpload}
            disabled={isUploading}
            className="w-full p-2 border rounded"
          />
          {isUploading && <p className="text-sm text-blue-600 mt-1">در حال آپلود...</p>}
        </div>
        
        <p className="text-xs text-gray-500 mb-2">یا آدرس ویدئو را وارد کنید:</p>
        
        <input
          type="text"
          value={content.url || ""}
          onChange={(e) => onChange({ ...content, url: e.target.value })}
          className="w-full p-2 border rounded"
          placeholder="https://www.youtube.com/embed/... یا آدرس فایل ویدئو"
        />
        <p className="text-xs text-gray-500 mt-1">
          برای YouTube: https://www.youtube.com/embed/VIDEO_ID
        </p>
      </div>
      
      <div className="mt-4 p-3 bg-yellow-50 rounded text-sm text-gray-700">
        <p className="font-bold mb-1">راهنمایی:</p>
        <p>اگر از افزودن مطلب منصرف شدید، حتماً تصاویر و رسانه‌ها را حذف کنید تا از ذخیره‌سازی غیرضروری جلوگیری شود.</p>
      </div>
      
      {/* Video preview for thumbnail capture */}
      {content.url && !content.thumbnail && (
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            پیش‌نمایش ویدئو برای گرفتن تصویر بندانگشتی
          </label>
          <div className="relative">
            <video
              ref={videoRef}
              src={content.url}
              controls
              className="w-full h-48 object-cover rounded"
            />
            <canvas ref={canvasRef} className="hidden" />
          </div>
          <button
            type="button"
            onClick={captureThumbnailFromVideo}
            className="mt-2 px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
            disabled={isUploading}
          >
            گرفتن تصویر بندانگشتی از این لحظه
          </button>
        </div>
      )}
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          تصویر بندانگشتی (اختیاری)
        </label>
        
        {content.thumbnail ? (
          <div className="mb-2">
            <img src={content.thumbnail} alt="Thumbnail" className="w-full h-32 object-cover rounded" />
            <button
              type="button"
              onClick={removeThumbnail}
              className="mt-2 px-3 py-1 bg-red-500 text-white rounded text-sm"
            >
              حذف تصویر بندانگشتی
            </button>
          </div>
        ) : (
          <div className="mb-3">
            <input
              type="file"
              accept="image/*"
              onChange={handleThumbnailUpload}
              disabled={isUploading}
              className="w-full p-2 border rounded"
            />
            {isUploading && <p className="text-sm text-blue-600 mt-1">در حال آپلود...</p>}
          </div>
        )}
        
        <p className="text-xs text-gray-500">
          می‌توانید برای ویدئو یک تصویر بندانگشتی انتخاب کنید یا از پیش‌نمایش ویدئو، تصویری از لحظه دلخواه بگیرید
        </p>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          عنوان ویدئو (اختیاری)
        </label>
        <input
          type="text"
          value={content.title || ""}
          onChange={(e) => onChange({ ...content, title: e.target.value })}
          className="w-full p-2 border rounded"
          placeholder="عنوان ویدئو"
        />
      </div>
    </div>
  );
};

export default VideoBlock;