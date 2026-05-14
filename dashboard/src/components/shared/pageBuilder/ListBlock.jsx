import React, { useState, useEffect } from "react";
import Plus from "@/components/icons/Plus";
import Minus from "@/components/icons/Minus";
import FormInput from "@/components/shared/input/FormInput";
import IconSelect from "@/components/shared/input/IconSelect";

const ListBlock = ({ items = { listTitle: "", items: [{ text: "", icon: null, color: "indigo" }] }, onChange }) => {
  const [listTitle, setListTitle] = useState(items.listTitle || "");
  const [listItems, setListItems] = useState(items.items || [{ text: "", icon: null, color: "indigo" }]);

  useEffect(() => {
    setListTitle(items.listTitle || "");
    setListItems(items.items || [{ text: "", icon: null, color: "indigo" }]);
  }, [items]);

  const handleAddItem = () => {
    const newItems = [...listItems, { text: "", icon: null, color: "indigo" }];
    setListItems(newItems);
    onChange({ listTitle, items: newItems });
  };

  const handleRemoveItem = (index) => {
    const newItems = [...listItems];
    newItems.splice(index, 1);
    setListItems(newItems);
    onChange({ listTitle, items: newItems });
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...listItems];
    newItems[index] = { ...newItems[index], [field]: value };
    setListItems(newItems);
    onChange({ listTitle, items: newItems });
  };

  const colorOptions = [
    { name: 'indigo', from: 'from-indigo-50', to: 'to-indigo-100', border: 'border-indigo-100' },
    { name: 'blue', from: 'from-blue-50', to: 'to-blue-100', border: 'border-blue-100' },
    { name: 'green', from: 'from-green-50', to: 'to-green-100', border: 'border-green-100' },
    { name: 'red', from: 'from-red-50', to: 'to-red-100', border: 'border-red-100' },
    { name: 'purple', from: 'from-purple-50', to: 'to-purple-100', border: 'border-purple-100' },
    { name: 'yellow', from: 'from-yellow-50', to: 'to-yellow-100', border: 'border-yellow-100' }
  ];

  return (
    <div className="list-block">
      {/* List Title */}
      <div className="mb-4">
        <FormInput
          type="text"
          value={listTitle}
          onChange={(e) => {
            setListTitle(e.target.value);
            onChange({ listTitle: e.target.value, items: listItems });
          }}
          placeholder="عنوان لیست (اختیاری)"
        />
      </div>

      <div className="flex justify-between items-center mb-4">
        <label className="block">لیست با آیکون</label>
        <button
          type="button"
          className="p-1 bg-green-500 text-white rounded"
          onClick={handleAddItem}
          title="افزودن آیتم"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-4">
        {listItems.map((item, index) => (
          <div key={index} className="flex flex-col gap-2 border-b pb-2">
            <div className="flex items-center gap-2">
              <IconSelect
                value={item.icon}
                onChange={(icon) => handleItemChange(index, 'icon', icon)}
                placeholder="انتخاب"
                className="w-32"
              />
              
              <FormInput
                type="text"
                value={item.text}
                onChange={(e) => handleItemChange(index, 'text', e.target.value)}
                placeholder="متن آیتم"
                className="flex-1"
              />
              
              {listItems.length > 1 && (
                <button
                  type="button"
                  className="p-1 bg-red-500 text-white rounded"
                  onClick={() => handleRemoveItem(index)}
                  title="حذف آیتم"
                >
                  <Minus className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Color Selection زیر آیتم */}
            <div className="flex gap-2 mt-1">
              {colorOptions.map((color) => (
                <button
                  key={color.name}
                  type="button"
                  className={`w-6 h-6 rounded-full bg-gradient-to-br ${color.from} ${color.to} border-2 ${item.color === color.name ? 'border-gray-800' : 'border-gray-300'}`}
                  onClick={() => handleItemChange(index, 'color', color.name)}
                  title={color.name}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ListBlock;
