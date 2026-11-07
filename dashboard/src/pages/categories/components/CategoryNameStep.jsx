function CategoryNameStep({ value, slug = "", onChange }) {
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
      <label className="mb-2 mt-4 block text-xs text-zinc-400">اسلاگ در لینک (مثل tutorial یا article)</label>
      <input className="w-full rounded-xl border border-zinc-800 bg-black text-white" dir="ltr" name="slug" onChange={onChange} placeholder="tutorial" value={slug} />
    </div>
  );
}

export default CategoryNameStep;

