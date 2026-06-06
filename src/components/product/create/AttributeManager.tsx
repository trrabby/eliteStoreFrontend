// components/product/create/AttributeManager.tsx
import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { motion } from "framer-motion";

interface Attribute {
  name: string;
  value: string;
}

interface AttributeManagerProps {
  attributes: Attribute[];
  onAttributesChange: (attributes: Attribute[]) => void;
}

export const AttributeManager = ({
  attributes,
  onAttributesChange,
}: AttributeManagerProps) => {
  const [newName, setNewName] = useState("");
  const [newValue, setNewValue] = useState("");

  const addAttribute = () => {
    if (newName.trim() && newValue.trim()) {
      onAttributesChange([
        ...attributes,
        { name: newName.trim(), value: newValue.trim() },
      ]);
      setNewName("");
      setNewValue("");
    }
  };

  const removeAttribute = async (index: number, name: string) => {
    const confirmed = window.confirm(`Remove attribute "${name}"?`);
    if (confirmed) {
      onAttributesChange(attributes.filter((_, i) => i !== index));
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="card p-6 space-y-4"
    >
      <h3 className="font-semibold text-gray-900">Product Attributes</h3>
      <p className="text-xs text-gray-500">
        Add common specifications for the product (e.g., Material, Care
        Instructions, Warranty). These apply to all variants.
      </p>

      {attributes.length > 0 && (
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Added Attributes
          </label>
          <div className="space-y-2">
            {attributes.map((attr, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between bg-gray-50 rounded-lg p-3"
              >
                <div className="flex-1">
                  <span className="text-sm font-medium text-gray-900">
                    {attr.name}:
                  </span>
                  <span className="text-sm text-gray-600 ml-2">
                    {attr.value}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => removeAttribute(idx, attr.name)}
                  className="p-1 text-gray-400 hover:text-red-500 transition-colors cursor-pointer"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="border-t border-gray-100 pt-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Add New Attribute
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="e.g. Material, Care Instructions, Warranty"
            className="flex-1 rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
          <input
            type="text"
            value={newValue}
            onChange={(e) => setNewValue(e.target.value)}
            placeholder="e.g. Cotton, Machine Wash, 1 Year"
            className="flex-1 rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
          <button
            type="button"
            onClick={addAttribute}
            className="px-4 py-2.5 bg-primary text-white rounded-xl hover:opacity-90 transition-colors cursor-pointer flex items-center gap-1"
          >
            <Plus size={16} />
            Add
          </button>
        </div>
      </div>
    </motion.div>
  );
};
