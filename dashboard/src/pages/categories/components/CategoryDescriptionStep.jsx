function CategoryDescriptionStep({ value, onChange }) {
  return (
    <div>
      <label className="mb-2 block text-xs text-zinc-400">توضیح</label>
      <textarea
        className="w-full rounded-xl border border-zinc-800 bg-black text-white"
        name="description"
        onChange={onChange}
        placeholder="توضیح کوتاه برای دسته‌بندی"
        rows="4"
        value={value}
      />
    </div>
  );
}

export default CategoryDescriptionStep;

