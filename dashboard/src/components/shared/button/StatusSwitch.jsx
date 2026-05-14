import React from 'react';

const StatusSwitch = ({ label, id, register, defaultChecked, onChange }) => {
  return (
    <label className="inline-flex items-center cursor-pointer justify-start w-full">
      <span className="ml-3 text-right">{label}</span>
      <input
        type="checkbox"
        className="sr-only peer"
        id={id}
        {...(register ? register(id) : {})}
        defaultChecked={defaultChecked}
        onChange={onChange}
      />
      <div className="relative w-11 h-6 bg-gray-200 rounded-full peer dark:bg-gray-700 peer-focus:ring-4 peer-focus:ring-green-300 dark:peer-focus:ring-blue-800 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-green-600 dark:peer-checked:bg-blue-600"></div>
    </label>
  );
};

export default StatusSwitch;
