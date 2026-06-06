// hooks/useCategories.ts
import { useState, useEffect } from "react";
import { getCategoryTree } from "@/services/category.service";

export interface Category {
  id: number;
  name: string;
  slug: string;
  parentId: number | null;
  children?: Category[];
}

export interface CategoryWithLevel extends Category {
  level: number;
}

export const useCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      setLoading(true);
      const res = await getCategoryTree();
      if (res?.success && Array.isArray(res.data)) {
        setCategories(res.data);
      } else if (Array.isArray(res)) {
        setCategories(res);
      }
      setLoading(false);
    };
    fetchCategories();
  }, []);

  const flattenCategories = (
    cats: Category[],
    level = 0,
  ): CategoryWithLevel[] => {
    let result: CategoryWithLevel[] = [];
    for (const cat of cats) {
      result.push({ ...cat, level });
      if (cat.children?.length) {
        result = result.concat(flattenCategories(cat.children, level + 1));
      }
    }
    return result;
  };

  const flatCategories = flattenCategories(categories);

  const filterCategories = (search: string) => {
    return flatCategories.filter((cat) =>
      cat.name.toLowerCase().includes(search.toLowerCase()),
    );
  };

  return {
    categories,
    flatCategories,
    loading,
    filterCategories,
  };
};
