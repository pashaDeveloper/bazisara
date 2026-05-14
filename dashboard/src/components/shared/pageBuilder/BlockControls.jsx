import React from "react";
import ChevronUp from "@/components/icons/ChevronUp";
import ChevronDown from "@/components/icons/ChevronDown";
import Minus from "@/components/icons/Minus";

const BlockControls = ({ blockId, index, totalBlocks, onRemove, onMoveUp, onMoveDown }) => {
  return (
    <div className="block-controls flex justify-end gap-2 mb-2">
      <button
        type="button"
        className="p-1 bg-red-500 text-white rounded"
        onClick={() => onRemove(blockId)}
        title="حذف بلوک"
      >
        <Minus className="w-4 h-4" />
      </button>
      
      {index > 0 && (
        <button
          type="button"
          className="p-1 bg-gray-500 text-white rounded"
          onClick={() => onMoveUp(blockId)}
          title="انتقال به بالا"
        >
          <ChevronUp className="w-4 h-4" />
        </button>
      )}
      
      {index < totalBlocks - 1 && (
        <button
          type="button"
          className="p-1 bg-gray-500 text-white rounded"
          onClick={() => onMoveDown(blockId)}
          title="انتقال به پایین"
        >
          <ChevronDown className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

export default BlockControls;