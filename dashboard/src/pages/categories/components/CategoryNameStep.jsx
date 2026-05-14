function CategoryNameStep({ value, onChange }) {
  return (
    <div>
      <label className="mb-2 block text-xs text-zinc-400">نام</label>
      <input
        className="w-full rounded-xl border border-zinc-800 bg-black text-white"
        name="name"
        onChange={onChange}
        placeholder="مثلا اکشن"
        value={value}
      />
    </div>
  );
}

export default CategoryNameStep;
