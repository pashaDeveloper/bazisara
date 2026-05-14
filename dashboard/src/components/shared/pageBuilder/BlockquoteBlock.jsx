import React from "react";

const BlockquoteBlock = ({ content, onChange }) => {
  // Define color options with lighter intensity
  const colorOptions = [
    { value: "indigo", label: "نیلی", classes: "from-indigo-50 to-indigo-50 border-indigo-100 text-indigo-800" },
    { value: "green", label: "سبز", classes: "from-green-50 to-green-50 border-green-100 text-green-800" },
    { value: "blue", label: "آبی", classes: "from-blue-50 to-blue-50 border-blue-100 text-blue-800" },
    { value: "purple", label: "بنفش", classes: "from-purple-50 to-purple-50 border-purple-100 text-purple-800" },
    { value: "red", label: "قرمز", classes: "from-red-50 to-red-50 border-red-100 text-red-800" },
    { value: "yellow", label: "زرد", classes: "from-yellow-50 to-yellow-50 border-yellow-100 text-yellow-800" }
  ];

  // Get the current color classes or default to indigo
  const currentColor = content.color || "indigo";
  const colorClasses = colorOptions.find(option => option.value === currentColor)?.classes || colorOptions[0].classes;

  return (
    <div className="blockquote-block">
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          متن نقل قول
        </label>
        <textarea
          value={content.text || ""}
          onChange={(e) => onChange({ ...content, text: e.target.value })}
          className="w-full p-2 border rounded"
          rows="4"
          placeholder="متن نقل قول را وارد کنید"
        />
      </div>
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          عنوان (اختیاری)
        </label>
        <input
          type="text"
          value={content.title || ""}
          onChange={(e) => onChange({ ...content, title: e.target.value })}
          className="w-full p-2 border rounded"
          placeholder="عنوان نقل قول"
        />
      </div>
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          نویسنده (اختیاری)
        </label>
        <input
          type="text"
          value={content.author || ""}
          onChange={(e) => onChange({ ...content, author: e.target.value })}
          className="w-full p-2 border rounded"
          placeholder="نویسنده نقل قول"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          رنگ نقل قول
        </label>
        <div className="flex flex-wrap gap-2">
          {colorOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              className={`px-3 py-2 rounded text-sm ${
                currentColor === option.value
                  ? "ring-2 ring-offset-2 " + (option.value === "indigo" ? "bg-indigo-100" : 
                                              option.value === "green" ? "bg-green-100" : 
                                              option.value === "blue" ? "bg-blue-100" : 
                                              "bg-purple-100")
                  : "bg-gray-100"
              }`}
              onClick={() => onChange({ ...content, color: option.value })}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BlockquoteBlock;