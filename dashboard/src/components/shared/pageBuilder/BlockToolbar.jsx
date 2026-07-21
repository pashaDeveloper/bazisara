import React from "react";

const BlockToolbar = ({ onAddBlock }) => {
  const blockTypes = [
    { type: "title", label: "عنوان", icon: "🔤" },
    { type: "ckeditor", label: "متن با ویرایشگر", icon: "📝" },
    { type: "image", label: "تصویر", icon: "🖼️" },
    { type: "list", label: "لیست با آیکون", icon: "📋" },
    { type: "table", label: "جدول", icon: "📊" },
    { type: "blockquote", label: "نقل قول", icon: "❝" },
    { type: "video", label: "ویدئو", icon: "🎬" },
    { type: "podcast", label: "پادکست", icon: "🎙️" },
    { type: "link", label: "لینک", icon: "🔗" }
  ];

  return (
    <div 
      className="block-toolbar flex flex-wrap gap-2 p-2 bg-gray-100 dark:bg-gray-900 rounded"
      style={{ color: 'var(--white, white)' }}
    >
      {blockTypes.map((blockType) => (
        <button
          key={blockType.type}
          type="button"
          className="flex items-center gap-2 rounded bg-blue-500 px-3 py-2 !text-white hover:bg-blue-600"
          style={{ color: "#fff" }}
          onClick={() => onAddBlock(blockType.type)}
        >
          <span className="!text-white" style={{ color: "#fff" }}>{blockType.icon}</span>
          <span className="!text-white" style={{ color: "#fff" }}>{blockType.label}</span>
        </button>
      ))}
    </div>
  );
};

export default BlockToolbar;
