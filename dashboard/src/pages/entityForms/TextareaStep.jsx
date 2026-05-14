function TextareaStep({ label = "توضیح", name = "description", onChange, placeholder, value }) {
  return (
    <div>
      <label className="mb-2 block text-xs text-zinc-400">{label}</label>
      <textarea
        className="w-full rounded-xl border border-zinc-800 bg-black text-white"
        name={name}
        onChange={onChange}
        placeholder={placeholder}
        rows="6"
        value={value}
      />
    </div>
  );
}

export default TextareaStep;
