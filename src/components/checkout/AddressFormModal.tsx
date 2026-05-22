"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import { FormInput } from "@/components/shared/FormInput";
import { addAddress, updateAddress } from "@/services/user.service";
import type { IAddress } from "@/types/user.types";

const schema = z.object({
  fullName: z.string().min(2),
  phone: z.string().min(10),
  addressLine1: z.string().min(5),
  addressLine2: z.string().optional(),
  city_district: z.string().min(2),
  postalCode: z.string().optional(),
  landmark: z.string().optional(),
  label: z.string().optional(),
  isDefault: z.boolean().optional(),
});

type FormData = z.infer<typeof schema>;

export function AddressFormModal({
  onClose,
  onSaved,
  editAddress,
}: {
  onClose: () => void;
  onSaved: () => void;
  editAddress?: IAddress;
}) {
  const [loading, setLoading] = useState(false);
  const isEdit = !!editAddress;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: editAddress
      ? {
          fullName: editAddress.fullName,
          phone: editAddress.phone,
          addressLine1: editAddress.addressLine1,
          addressLine2: editAddress.addressLine2 ?? "",
          city_district: editAddress.city_district,
          postalCode: editAddress.postalCode ?? "",
          landmark: editAddress.landmark ?? "",
          label: editAddress.label ?? "",
          isDefault: editAddress.isDefault ?? false,
        }
      : undefined,
  });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("data", JSON.stringify({ ...data, country: "BD" }));

      const res = isEdit
        ? await updateAddress(editAddress!.id, fd)
        : await addAddress(fd);

      if (!res?.success) {
        toast.error(res?.message ?? "Failed.");
        return;
      }
      toast.success(isEdit ? "Address updated!" : "Address added!");
      onSaved();
    } catch {
      toast.error("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="fixed inset-x-4 top-1/2 -translate-y-1/2 z-50
                   bg-white rounded-3xl p-6 shadow-2xl max-w-lg mx-auto
                   max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-display font-bold text-gray-900 text-lg">
            {isEdit ? "Edit Address" : "Add New Address"}
          </h3>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-gray-100 text-gray-400"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <FormInput
              label="Full Name"
              placeholder="Rahim Uddin"
              error={errors.fullName?.message}
              required
              {...register("fullName")}
            />
            <FormInput
              label="Phone"
              placeholder="01XXXXXXXXX"
              error={errors.phone?.message}
              required
              {...register("phone")}
            />
          </div>
          <FormInput
            label="Address Line 1"
            placeholder="House, Road, Block"
            error={errors.addressLine1?.message}
            required
            {...register("addressLine1")}
          />
          <FormInput
            label="Address Line 2 (optional)"
            placeholder="Area"
            {...register("addressLine2")}
          />
          <div className="grid grid-cols-2 gap-3">
            <FormInput
              label="City / District"
              placeholder="Dhaka"
              error={errors.city_district?.message}
              required
              {...register("city_district")}
            />
            <FormInput
              label="Postal Code"
              placeholder="1200"
              {...register("postalCode")}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <FormInput
              label="Landmark (optional)"
              placeholder="Near mosque"
              {...register("landmark")}
            />
            <FormInput
              label="Label (optional)"
              placeholder="Home / Office"
              {...register("label")}
            />
          </div>
          <label className="flex items-center gap-2.5 cursor-pointer">
            <input
              type="checkbox"
              className="accent-primary w-4 h-4"
              {...register("isDefault")}
            />
            <span className="text-sm text-gray-700">
              Set as default address
            </span>
          </label>
          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary py-3.5 flex items-center justify-center gap-2 mt-2 disabled:opacity-60"
          >
            {loading ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
              />
            ) : isEdit ? (
              "Save Changes"
            ) : (
              "Save Address"
            )}
          </button>
        </form>
      </motion.div>
    </>
  );
}
