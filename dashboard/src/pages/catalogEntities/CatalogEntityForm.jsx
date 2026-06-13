import SteppedEntityForm from "../entityForms/SteppedEntityForm";

function CatalogEntityForm({ backPath, createMutation, entityLabel, fields, getQuery, mode = "create", title, updateMutation }) {
  return (
    <SteppedEntityForm
      backPath={backPath}
      createMutation={createMutation}
      entityLabel={entityLabel}
      fields={fields}
      getQuery={getQuery}
      mode={mode}
      title={title}
      updateMutation={updateMutation}
    />
  );
}

export default CatalogEntityForm;
