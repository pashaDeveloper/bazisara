import React, { useState, useEffect } from "react";
import FormInput from "@/components/shared/input/FormInput";
import IconSelect from "@/components/shared/input/IconSelect";

const TitleBlock = ({ content = { text: "", icon: null }, onChange }) => {
  const [titleText, setTitleText] = useState(content.text || "");
  const [selectedIcon, setSelectedIcon] = useState(content.icon || null);

  useEffect(() => {
    setTitleText(content.text || "");
    setSelectedIcon(content.icon || null);
  }, [content]);

  const handleTextChange = (e) => {
    const newText = e.target.value;
    setTitleText(newText);
    onChange({ text: newText, icon: selectedIcon });
  };

  const handleIconChange = (icon) => {
    setSelectedIcon(icon);
    onChange({ text: titleText, icon });
  };

  return (
    <div className="title-block">
      <div className="flex items-center gap-2 mb-2">
        {/* Icon Selection Dropdown */}
        <IconSelect
          value={selectedIcon}
          onChange={handleIconChange}
          placeholder="انتخاب آیکون"
          className="w-32"
        />
        
        {/* Title Input */}
        <div className="flex-1">
          <FormInput
            type="text"
            value={titleText}
            onChange={handleTextChange}
            placeholder="عنوان"
          />
        </div>
      </div>
    </div>
  );
};

export default TitleBlock;