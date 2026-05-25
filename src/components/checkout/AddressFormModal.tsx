/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { X, MapPin, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { FormInput } from "@/components/shared/FormInput";
import { addAddress, updateAddress } from "@/services/user.service";

import type { IAddress } from "@/types/user.types";

const schema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  phone: z.string().min(10, "Valid phone number is required"),
  addressLine1: z.string().min(5, "Address is required"),
  addressLine2: z.string().optional(),
  city_district: z.string().min(2, "City/District is required"),
  postalCode: z.string().optional(),
  landmark: z.string().optional(),
  label: z.string().optional(),
  isDefault: z.boolean().optional(),
});

type FormData = z.infer<typeof schema>;

// Helper function to reverse geocode coordinates to address
async function reverseGeocode(
  lat: number,
  lng: number,
): Promise<{
  addressLine1?: string;
  city_district?: string;
  country?: string;
  postalCode?: string;
}> {
  try {
    // Using OpenStreetMap's Nominatim API (free, no API key required)
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`,
    );

    if (!response.ok) throw new Error("Geocoding failed");

    const data = await response.json();
    const address = data.address;

    // Build address components
    const road = address.road || address.pedestrian || "";
    const suburb = address.suburb || "";
    const city =
      address.city ||
      address.town ||
      address.village ||
      address.state_district ||
      "";
    const postcode = address.postcode || "";
    const country = address.country_code?.toUpperCase() || "BD";

    let addressLine1 = road;
    if (suburb && suburb !== road) {
      addressLine1 += addressLine1 ? `, ${suburb}` : suburb;
    }

    return {
      addressLine1: addressLine1 || "Location detected",
      city_district: city,
      country: country,
      postalCode: postcode,
    };
  } catch (error) {
    console.error("Reverse geocoding error:", error);
    return {};
  }
}

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
  const [locating, setLocating] = useState(false);

  const isEdit = !!editAddress;

  /**
   * LOCATION STATE (IMPORTANT FIX)
   * You must not rely only on form state for geo data
   */
  const [location, setLocation] = useState({
    latitude: editAddress?.latitude ? Number(editAddress.latitude) : null,
    longitude: editAddress?.longitude ? Number(editAddress.longitude) : null,
  });

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      fullName: "",
      phone: "",
      addressLine1: "",
      addressLine2: "",
      city_district: "",
      postalCode: "",
      landmark: "",
      label: "",
      isDefault: false,
    },
  });

  /**
   * FIX: Proper hydration for edit mode
   */
  useEffect(() => {
    if (!editAddress) return;

    reset({
      fullName: editAddress.fullName,
      phone: editAddress.phone,
      addressLine1: editAddress.addressLine1,
      addressLine2: editAddress.addressLine2 ?? "",
      city_district: editAddress.city_district,
      postalCode: editAddress.postalCode ?? "",
      landmark: editAddress.landmark ?? "",
      label: editAddress.label ?? "",
      isDefault: editAddress.isDefault ?? false,
    });

    setLocation({
      latitude: editAddress.latitude ? Number(editAddress.latitude) : null,
      longitude: editAddress.longitude ? Number(editAddress.longitude) : null,
    });
  }, [editAddress, reset]);

  // Get current location
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      return;
    }

    setLocating(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        console.log({ position });
        const { latitude, longitude } = position.coords;

        // Update location state
        setLocation({
          latitude: Number(latitude),
          longitude: Number(longitude),
        });

        // Show loading toast while reverse geocoding
        const toastId = toast.loading("Getting address from location...");

        try {
          // Reverse geocode to get address details
          const addressData = await reverseGeocode(latitude, longitude);

          if (addressData.addressLine1) {
            setValue("addressLine1", addressData.addressLine1);
          }
          if (addressData.city_district) {
            setValue("city_district", addressData.city_district);
          }
          if (addressData.postalCode) {
            setValue("postalCode", addressData.postalCode);
          }

          toast.success("Location detected! Address fields updated.", {
            id: toastId,
          });
        } catch (error) {
          console.error("Error getting address details:", error);
          toast.warning(
            "Location coordinates captured, but could not fetch address details. Please fill manually.",
            { id: toastId },
          );
        } finally {
          setLocating(false);
        }
      },
      (error) => {
        setLocating(false);
        let errorMessage = "Unable to get your location";

        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage =
              "Location permission denied. Please enable location access.";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = "Location information unavailable";
            break;
          case error.TIMEOUT:
            errorMessage = "Location request timed out";
            break;
        }

        toast.error(errorMessage);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      },
    );
  };

  const onSubmit = async (data: FormData) => {
    setLoading(true);

    try {
      const payload = {
        ...data,
        country: "BD",

        latitude: Number(location.latitude) || null,
        longitude: Number(location.longitude) || null,
      };

      const fd = new FormData();
      fd.append("data", JSON.stringify(payload));

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
      {/* Overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
      />

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="fixed inset-x-4 top-1/2 z-50 mx-auto max-h-[90vh]
                   max-w-lg -translate-y-1/2 overflow-y-auto
                   rounded-3xl bg-white p-6 shadow-2xl"
      >
        {/* Header */}
        <div className="mb-5 flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-900">
            {isEdit ? "Edit Address" : "Add New Address"}
          </h3>

          <button
            onClick={onClose}
            className="cursor-pointer rounded-xl p-2 text-gray-400 hover:bg-gray-100"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <FormInput
              label="Full Name"
              error={errors.fullName?.message}
              {...register("fullName")}
            />

            <FormInput
              label="Phone"
              error={errors.phone?.message}
              {...register("phone")}
            />
          </div>

          {/* Location Button - Address Line 1 with locate button */}
          <div className="relative">
            <FormInput
              label="Address Line 1"
              error={errors.addressLine1?.message}
              {...register("addressLine1")}
            />
            <button
              type="button"
              onClick={getCurrentLocation}
              disabled={locating}
              className="absolute right-2 top-8 cursor-pointer rounded-lg bg-primary/10 p-1.5 text-primary transition-colors hover:bg-primary/20 disabled:opacity-50"
              title="Use my current location"
            >
              {locating ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <MapPin size={18} />
              )}
            </button>
          </div>

          {/* Optional: Separate location button with label */}
          <div className="mb-2">
            <button
              type="button"
              onClick={getCurrentLocation}
              disabled={locating}
              className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-primary/30 bg-primary/5 py-2 text-sm font-medium text-primary transition-all hover:bg-primary/10 disabled:opacity-50"
            >
              {locating ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Getting your location...
                </>
              ) : (
                <>
                  <MapPin size={16} />
                  Use My Current Location
                </>
              )}
            </button>
          </div>

          <FormInput label="Address Line 2" {...register("addressLine2")} />

          <div className="grid grid-cols-2 gap-3">
            <FormInput
              label="City"
              error={errors.city_district?.message}
              {...register("city_district")}
            />

            <FormInput label="Postal Code" {...register("postalCode")} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <FormInput label="Landmark" {...register("landmark")} />

            <FormInput label="Label" {...register("label")} />
          </div>

          {/* Show coordinates if available */}
          {location.latitude && location.longitude && (
            <div className="rounded-lg bg-gray-50 p-2 text-xs text-gray-500">
              📍 Coordinates: {location.latitude}, {location.longitude}
            </div>
          )}

          {/* Default */}
          <label className="flex cursor-pointer items-center gap-2">
            <input
              type="checkbox"
              className="h-4 w-4 accent-primary"
              {...register("isDefault")}
            />

            <span className="text-sm text-gray-700">
              Set as default address
            </span>
          </label>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="btn-primary mt-2 flex w-full cursor-pointer items-center justify-center gap-2 py-3.5 disabled:opacity-60"
          >
            {loading ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{
                  duration: 0.8,
                  repeat: Infinity,
                  ease: "linear",
                }}
                className="h-5 w-5 rounded-full border-2 border-white/30 border-t-white"
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
