import React, { useState } from "react";

const TableBlock = ({ content, onChange }) => {
  const [title, setTitle] = useState(content.title || "");
  const [rows, setRows] = useState(content.rows || [[]]);
  const [columns, setColumns] = useState(content.columns || []);

  // Update table title
  const updateTitle = (value) => {
    setTitle(value);
    onChange({ title: value, rows: rows, columns: columns });
  };

  // Add a new column
  const addColumn = () => {
    const newColumns = [...columns, `ستون ${columns.length + 1}`];
    const newRows = rows.map(row => [...row, ""]);
    setColumns(newColumns);
    setRows(newRows);
    onChange({ title: title, rows: newRows, columns: newColumns });
  };

  // Add a new row
  const addRow = () => {
    const newRow = Array(columns.length).fill("");
    const newRows = [...rows, newRow];
    setRows(newRows);
    onChange({ title: title, rows: newRows, columns: columns });
  };

  // Update cell content
  const updateCell = (rowIndex, colIndex, value) => {
    const newRows = [...rows];
    newRows[rowIndex][colIndex] = value;
    setRows(newRows);
    onChange({ title: title, rows: newRows, columns: columns });
  };

  // Update column header
  const updateColumnHeader = (colIndex, value) => {
    const newColumns = [...columns];
    newColumns[colIndex] = value;
    setColumns(newColumns);
    onChange({ title: title, rows: rows, columns: newColumns });
  };

  // Remove column
  const removeColumn = (colIndex) => {
    if (columns.length <= 1) return;
    const newColumns = columns.filter((_, i) => i !== colIndex);
    const newRows = rows.map(row => row.filter((_, i) => i !== colIndex));
    setColumns(newColumns);
    setRows(newRows);
    onChange({ title: title, rows: newRows, columns: newColumns });
  };

  // Remove row
  const removeRow = (rowIndex) => {
    if (rows.length <= 1) return;
    const newRows = rows.filter((_, i) => i !== rowIndex);
    setRows(newRows);
    onChange({ title: title, rows: newRows, columns: columns });
  };

  return (
    <div className="table-block">
      <div className="mb-4">
        <h3 className="text-lg font-medium mb-2">جدول</h3>
        
        {/* Table structure */}
        <div className="space-y-2">
          {/* Column headers */}
          <div className="flex gap-2 overflow-x-auto">
            {columns.map((col, colIndex) => (
              <div key={colIndex} className="flex-1 min-w-[120px]">
                <div className="flex items-center gap-1">
                  <input
                    type="text"
                    value={col}
                    onChange={(e) => updateColumnHeader(colIndex, e.target.value)}
                    placeholder={`ستون ${colIndex + 1}`}
                    className="p-2 rounded border w-full font-bold text-center"
                  />
                  {columns.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeColumn(colIndex)}
                      className="text-red-500 hover:text-red-700"
                    >
                      ×
                    </button>
                  )}
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={addColumn}
              className="px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              +
            </button>
          </div>

          {/* Table title input - placed above the table data */}
          <div className="mb-3">
            <input
              type="text"
              value={title}
              onChange={(e) => updateTitle(e.target.value)}
              placeholder="عنوان جدول"
              className="p-2 rounded border w-full font-bold text-center"
            />
          </div>

          {/* Table rows */}
          <div className="space-y-2">
            {rows.map((row, rowIndex) => (
              <div key={rowIndex} className="flex gap-2">
                {row.map((cell, colIndex) => (
                  <div key={colIndex} className="flex-1 min-w-[120px]">
                    <input
                      type="text"
                      value={cell}
                      onChange={(e) => updateCell(rowIndex, colIndex, e.target.value)}
                      placeholder={`ردیف ${rowIndex + 1}, ستون ${colIndex + 1}`}
                      className="p-2 rounded border w-full"
                    />
                  </div>
                ))}
                {rows.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeRow(rowIndex)}
                    className="px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                  >
                    -
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={addRow}
              className="px-3 py-2 bg-green-500 text-white rounded hover:bg-green-600 w-full"
            >
              افزودن ردیف
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TableBlock;