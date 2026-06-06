// hooks/useBrands.ts
import { useState, useEffect } from "react";
import { getAllBrands } from "@/services/brand.service";

export interface Brand {
  id: number;
  name: string;
  slug: string;
  logo?: string;
}

export const useBrands = () => {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBrands = async () => {
      setLoading(true);
      const res = await getAllBrands({ limit: 100, isActive: true });
      if (res?.success && Array.isArray(res.data?.brands)) {
        setBrands(res.data.brands);
      } else if (res?.success && Array.isArray(res.data)) {
        setBrands(res.data);
      } else if (Array.isArray(res)) {
        setBrands(res);
      }
      setLoading(false);
    };
    fetchBrands();
  }, []);

  const filterBrands = (search: string) => {
    return brands.filter((brand) =>
      brand.name.toLowerCase().includes(search.toLowerCase()),
    );
  };

  return {
    brands,
    loading,
    filterBrands,
  };
};
