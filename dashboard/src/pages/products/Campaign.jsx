import { useGetUnitsQuery } from "@/services/unit/unitApi";
import React, { useEffect, useMemo, useState } from "react";
import { toast } from "react-hot-toast";
import Plus from "@/components/icons/Plus";
import Trash from "@/components/icons/Trash";
import Edit from "@/components/icons/Edit";
import UnitPrice from "./UnitPrice";
import { useFieldArray } from "react-hook-form";
import NavigationButton from "@/components/shared/button/NavigationButton";
import { useGetWarrantiesQuery } from "@/services/warranty/warrantyApi";
import { useGetColorsQuery } from "@/services/color/colorApi";
import { useGetInsurancesQuery } from "@/services/insurance/insuranceApi";
import Modal from "@/components/shared/modal/Modal";
import Dropdown from "@/components/shared/dropDown/Dropdown";

// Mock queries
const useGetDigiplusQuery = () => ({
  isLoading: false,
  data: { data: [{ _id: "dp1", name: "DigiPlus Plan 1" }] },
  error: null
});
const useGetSellerQuery = () => ({
  isLoading: false,
  data: { data: [{ _id: "s1", name: "Seller A" }] },
  error: null
});
const useGetShipmentMethodQuery = () => ({
  isLoading: false,
  data: { data: [{ _id: "sm1", name: "Express Shipping" }] },
  error: null
});
const useGetCreatorQuery = () => ({
  isLoading: false,
  data: { data: [{ _id: "a1", name: "Admin 1" }] },
  error: null
});

const Campaign = ({ register, errors, watch, control, prevStep, nextStep }) => {
  // Queries
  const {
    isLoading: fetchingUnits,
    data: fetchUnitsData,
    error: fetchUnitsError
  } = useGetUnitsQuery();

  const { data: techplusData } = useGetDigiplusQuery();
  const { data: warrantyData } = useGetWarrantiesQuery({
    page: 1,
    limit: Infinity,
    search: ""
  });
  const { data: colorData } = useGetColorsQuery({
    page: 1,
    limit: Infinity,
    search: ""
  });
  const { data: insuranceData } = useGetInsurancesQuery({
    page: 1,
    limit: Infinity,
    search: ""
  });
  const { data: sellerData } = useGetSellerQuery();
  const { data: shipmentMethodData } = useGetShipmentMethodQuery();
  const { data: creatorData } = useGetCreatorQuery();
  const {
    fields: variations,
    append,
    remove
  } = useFieldArray({
    control,
    name: "variations"
  });

  // Options
  const units = useMemo(() => fetchUnitsData?.data || [], [fetchUnitsData]);
  const techplusOptions = useMemo(
    () => techplusData?.data || [],
    [techplusData]
  );
  const sellerOptions = useMemo(() => sellerData?.data || [], [sellerData]);
  const shipmentMethodOptions = useMemo(
    () => shipmentMethodData?.data || [],
    [shipmentMethodData]
  );
  const creatorOptions = useMemo(() => creatorData?.data || [], [creatorData]);

  const warenties = useMemo(
    () =>
      warrantyData?.data?.map((warranty) => ({
        id: warranty._id,
        value: warranty._id,
        label: warranty.title_fa
      })) || [],
    [warrantyData]
  );

  const colors = useMemo(
    () =>
      colorData?.data?.map((color) => ({
        id: color._id,
        value: color._id,
        label: color.title_fa
      })) || [],
    [colorData]
  );

  const insurances = useMemo(
    () =>
      insuranceData?.data?.map((insurance) => ({
        id: insurance._id,
        value: insurance._id,
        label: insurance.title_fa
      })) || [],
    [insuranceData]
  );

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);

  useEffect(() => {
    if (fetchingUnits) {
      toast.loading("در حال دریافت واحد ...", { id: "fetchUnits" });
    }
    if (fetchUnitsData) {
      toast.success(fetchUnitsData?.description || "واحدها دریافت شد", {
        id: "fetchUnits"
      });
    }
    if (fetchUnitsError) {
      toast.error(
        fetchUnitsError?.data?.description || "خطا در دریافت واحدها",
        {
          id: "fetchUnits"
        }
      );
    }
  }, [fetchingUnits, fetchUnitsData, fetchUnitsError]);

  const campaignState = watch("campaignState");

  const openModal = (index = null) => {
    setEditingIndex(index);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingIndex(null);
  };

  const handleAddVariation = () => {
    append({
      unit: "",
      price: "",
      stock: 0,
      lowStockThreshold: 10,
      lead_time: 0,
      rank: 0,
      rate: 0,
      status: "",
      properties: {
        is_fast_shipping: false,
        is_ship_by_seller: false,
        is_multi_warehouse: false,
        has_similar_variants: false,
        is_rural: false,
        in_techkala_warehouse: false
      },
      techplus: "",
      warranty: "",
      color: "",
      seller: "",
      techclub: { point: 0 },
      insurance: "",
      shipment_methods: "",
      has_importer_price: false,
      manufacture_price_not_exist: false,
      has_best_price_in_last_month: false,
      variant_badges: [],
      creator: ""
    });
    openModal(variations.length);
  };

  return (
    <>
      <div className="w-full flex flex-col gap-y-4">
        {/* Campaign Section */}
        <label
          htmlFor="campaign"
          className="w-full flex p-4 rounded flex-col border gap-y-1"
        >
          <span className="text-sm">کمپین فروش*</span>
          <div className="flex flex-row gap-x-4">
            <input
              type="text"
              name="campaignTitle"
              id="campaignTitle"
              {...register("campaignTitle", {
                required: "وارد کردن عنوان کمپین الزامی است",
                minLength: {
                  value: 3,
                  message: "عنوان کمپین باید حداقل ۳ حرف داشته باشد"
                },
                maxLength: {
                  value: 30,
                  message: "عنوان کمپین نباید بیشتر از ۳۰ حرف باشد"
                }
              })}
              className="w-full rounded border px-2 py-1"
              placeholder="عنوان کمپین فروش را وارد کنید"
              required
            />
            <Dropdown
              name="campaignState"
              id="campaignState"
              items={[
                { value: "جدید", label: "جدید" },
                { value: "تخفیف‌دار", label: "تخفیف‌دار" },
                { value: "تمام‌شده", label: "تمام‌شده" },
                { value: "در-حال-فروش", label: "در حال فروش" }
              ]}
              placeholder="یک مورد انتخاب کنید"
              className={"w-full h-12"}
              returnType="id"
            />
          </div>
          {errors.campaignTitle && (
            <span className="text-red-500 text-sm">
              {errors.campaignTitle.message}
            </span>
          )}
          {errors.campaignState && (
            <span className="text-red-500 text-sm">
              {errors.campaignState.message}
            </span>
          )}
          {campaignState === "discount" && (
            <input
              type="number"
              name="discountAmount"
              id="discountAmount"
              {...register("discountAmount", {
                required: "وارد کردن درصد تخفیف الزامی است",
                min: { value: 1, message: "درصد تخفیف باید حداقل ۱ باشد" },
                max: { value: 99, message: "درصد تخفیف نباید بیشتر از ۹۹ باشد" }
              })}
              className="w-full border p-2 rounded mt-2"
              placeholder="درصد تخفیف را وارد کنید"
            />
          )}
          {errors.discountAmount && (
            <span className="text-red-500 text-sm">
              {errors.discountAmount.message}
            </span>
          )}
        </label>

        {/* Variations Section */}
        <label
          htmlFor="variations"
          className="flex w-full flex-col gap-y-2 p-2 max-h-[300px] overflow-y-auto"
        >
          <span className="text-sm">درج قیمت بر اساس واحد*</span>
          <div className="flex flex-col gap-y-4">
            {variations.map((field, index) => (
              <div key={field.id} className="flex items-center gap-x-2">
                <span>نسخه {index + 1}</span>
                <button
                  type="button"
                  className="bg-blue-100 dark:bg-green-100 border border-blue-900 dark:border-green-900 text-blue-900 dark:text-green-900 py-1 rounded flex flex-row gap-x-1 items-center px-2 w-fit text-xs"
                  onClick={() => openModal(index)}
                >
                  <Edit className="w-4 h-4" /> ویرایش
                </button>
                <button
                  type="button"
                  className="bg-red-100  border border-red-900  text-red-900  py-1 rounded flex flex-row gap-x-1 items-center px-2 w-fit text-xs"
                  onClick={() => remove(index)}
                >
                  <Trash className="w-4 h-4" /> حذف
                </button>
              </div>
            ))}
            <button
              type="button"
              className="bg-green-100 dark:bg-blue-100 border border-green-900 dark:border-blue-900 text-green-900 dark:text-blue-900 py-1 rounded flex flex-row gap-x-1 items-center px-2 w-fit text-xs"
              onClick={handleAddVariation}
            >
              <Plus className="w-4 h-4" /> افزودن واحد و قیمت
            </button>
          </div>
        </label>
      </div>

      <Modal isOpen={isModalOpen} onClose={closeModal} className="lg:w-2/3 md:h-3/4">
        <UnitPrice
          control={control}
          index={editingIndex !== null ? editingIndex : variations.length - 1}
          remove={remove}
          errors={errors}
          units={units}
          watch={watch}
          techplusOptions={techplusOptions}
          warrantyOptions={warenties}
          colorOptions={colors}
          sellerOptions={sellerOptions}
          insuranceOptions={insurances}
          shipmentMethodOptions={shipmentMethodOptions}
          creatorOptions={creatorOptions}
          onClose={closeModal} // Pass onClose to UnitPrice
        />
      </Modal>

      {/* Navigation Buttons */}
      <div className="flex justify-between mt-12">
        <NavigationButton direction="next" onClick={nextStep} />
        <NavigationButton direction="prev" onClick={prevStep} />
      </div>
    </>
  );
};

export default Campaign;
