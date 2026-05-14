import IconPicker from "@/components/shared/IconPicker";

function CategoryIconStep({ form, icons = [], isLoadingIcons = false, onChange }) {
  return (
    <IconPicker
      icons={icons}
      isLoadingIcons={isLoadingIcons}
      name="icon"
      onChange={onChange}
      value={form.icon}
    />
  );
}

export default CategoryIconStep;
