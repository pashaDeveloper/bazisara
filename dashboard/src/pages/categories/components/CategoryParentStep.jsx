import { SingleSelectDropdown } from "@/components/shared/Dropdown";

function flattenTreeOptions(nodes = [], depth = 0) {
  return nodes.flatMap((node) => [
    {
      label: `${"- ".repeat(depth)}${node.name}`,
      value: node._id,
    },
    ...(node.children?.length ? flattenTreeOptions(node.children, depth + 1) : []),
  ]);
}

function CategoryParentStep({ tree, value, onChange }) {
  return (
    <SingleSelectDropdown
      label="والد"
      name="parent"
      onChange={onChange}
      options={[{ label: "بدون والد", value: "" }, ...flattenTreeOptions(tree)]}
      placeholder="انتخاب والد"
      value={value}
    />
  );
}

export default CategoryParentStep;
