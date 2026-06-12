import CategoryDescriptionStep from "./CategoryDescriptionStep";
import CategoryIconStep from "./CategoryIconStep";
import CategoryImageStep from "./CategoryImageStep";
import CategoryNameStep from "./CategoryNameStep";
import CategoryParentStep from "./CategoryParentStep";
import CategoryFiltersStep from "./CategoryFiltersStep";

function CategoryStepContent({
  stepKey,
  form,
  imagePreview,
  setForm,
  setImagePreview,
  tree,
  filterDefinitions,
  icons,
  isLoadingIcons,
  onChange,
}) {
  const stepComponents = {
    image: (
      <CategoryImageStep
        imagePreview={imagePreview}
        setForm={setForm}
        setImagePreview={setImagePreview}
      />
    ),
    name: <CategoryNameStep value={form.name} onChange={onChange} />,
    parent: (
      <CategoryParentStep
        tree={tree}
        value={form.parent}
        onChange={onChange}
      />
    ),
    icon: (
      <CategoryIconStep
        form={form}
        icons={icons}
        isLoadingIcons={isLoadingIcons}
        onChange={onChange}
      />
    ),
    description: (
      <CategoryDescriptionStep
        value={form.description}
        onChange={onChange}
      />
    ),
    filters: (
      <CategoryFiltersStep
        definitions={filterDefinitions}
        selectedFilters={form.selectedFilters}
        setForm={setForm}
      />
    ),
  };

  return stepComponents[stepKey] || null;
}

export default CategoryStepContent;

