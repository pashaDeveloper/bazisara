function TextInputStep({ label, name, onChange, placeholder, type = "text", value }) {
  return (
    <div>
      <label className="mb-2 block text-xs text-zinc-400">{label}</label>
      <input
        className="w-full rounded-xl border border-zinc-800 bg-black text-white"
        name={name}
        onChange={onChange}
        placeholder={placeholder}
        type={type}
        value={value}
      />
    </div>
  );
}

export default TextInputStep;
