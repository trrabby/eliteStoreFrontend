/* eslint-disable react/no-unescaped-entities */
// components/product/create/VariantOptionBuilder.tsx
import { Plus, Trash2, X } from "lucide-react";

interface OptionType {
  name: string;
  values: string[];
}

interface VariantOptionBuilderProps {
  optionTypes: OptionType[];
  newOptionName: string;
  newOptionValue: string;
  onNewOptionNameChange: (value: string) => void;
  onNewOptionValueChange: (value: string) => void;
  onAddOption: () => void;
  onRemoveOptionValue: (optionName: string, value: string) => void;
  onRemoveOptionType: (optionName: string) => void;
  onGenerateVariants: () => void;
  canGenerate: boolean;
}

export const VariantOptionBuilder = ({
  optionTypes,
  newOptionName,
  newOptionValue,
  onNewOptionNameChange,
  onNewOptionValueChange,
  onAddOption,
  onRemoveOptionValue,
  onRemoveOptionType,
  onGenerateVariants,
  canGenerate,
}: VariantOptionBuilderProps) => {
  return (
    <div className="card p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-900">
          Variant Options (Color, Size, etc.)
        </h3>
        <button
          type="button"
          onClick={onGenerateVariants}
          disabled={!canGenerate}
          className="px-3 py-1.5 bg-primary/10 text-primary text-sm rounded-lg hover:bg-primary/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          Generate Variants
        </button>
      </div>
      <p className="text-xs text-gray-500">
        Define option types like Color, Size, etc. Then click "Generate
        Variants" to create all combinations.
      </p>

      {optionTypes.length > 0 && (
        <div className="space-y-3">
          {optionTypes.map((option) => (
            <div
              key={option.name}
              className="border border-gray-100 rounded-lg p-3"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-900">
                  {option.name}
                </span>
                <button
                  type="button"
                  onClick={() => onRemoveOptionType(option.name)}
                  className="text-gray-400 hover:text-red-500 transition-colors"
                >
                  <Trash2 size={14} />
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {option.values.map((value) => (
                  <span
                    key={value}
                    className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                  >
                    {value}
                    <button
                      type="button"
                      onClick={() => onRemoveOptionValue(option.name, value)}
                      className="hover:text-red-500 transition-colors"
                    >
                      <X size={10} />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="border-t border-gray-100 pt-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Add Option Type
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={newOptionName}
            onChange={(e) => onNewOptionNameChange(e.target.value)}
            placeholder="e.g. Color, Size, Material"
            className="flex-1 rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
          <input
            type="text"
            value={newOptionValue}
            onChange={(e) => onNewOptionValueChange(e.target.value)}
            placeholder="e.g. Red, Large, Cotton"
            className="flex-1 rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
          <button
            type="button"
            onClick={onAddOption}
            className="px-4 py-2.5 bg-primary text-white rounded-xl hover:opacity-90 transition-colors cursor-pointer flex items-center gap-1"
          >
            <Plus size={16} />
            Add
          </button>
        </div>
      </div>
    </div>
  );
};
