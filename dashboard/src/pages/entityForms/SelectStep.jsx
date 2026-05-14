function SelectStep({ label, name, onChange, options, value }) {
  return (
    <div>
      <label className="mb-2 block text-xs text-zinc-400">{label}</label>
      <select
        className="w-full rounded-xl border border-zinc-800 bg-black text-white"
        name={name}
        onChange={onChange}
        value={value}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export default SelectStep;
