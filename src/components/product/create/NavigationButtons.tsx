// components/product/create/NavigationButtons.tsx
import { ChevronLeft, ChevronRight, Check, Save } from "lucide-react";
import { motion } from "framer-motion";

interface NavigationButtonsProps {
  onBack?: () => void;
  onNext?: () => void;
  onComplete?: () => void;
  onUpdate?: () => void;
  isFirstStep: boolean;
  isLastStep: boolean;
  saving: boolean;
  showUpdateButton?: boolean;
}

export const NavigationButtons = ({
  onBack,
  onNext,
  onComplete,
  onUpdate,
  isFirstStep,
  isLastStep,
  saving,
  showUpdateButton = false,
}: NavigationButtonsProps) => {
  return (
    <div className="flex gap-3 justify-between">
      {!isFirstStep && onBack && (
        <button
          type="button"
          onClick={onBack}
          disabled={saving}
          className="btn-secondary px-6 py-2.5 text-sm flex items-center gap-2 cursor-pointer disabled:opacity-50"
        >
          <ChevronLeft size={16} />
          Back
        </button>
      )}

      <div className="flex-1"></div>

      {/* Update Button - shows when there are unsaved changes on a completed step */}
      {showUpdateButton && onUpdate && (
        <button
          type="button"
          onClick={onUpdate}
          disabled={saving}
          className="px-6 py-2.5 text-sm flex items-center gap-2 rounded-xl font-medium transition-all bg-yellow-50 text-yellow-700 hover:bg-yellow-100 border border-yellow-200 disabled:opacity-50 cursor-pointer"
        >
          {saving ? (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
              className="w-4 h-4 border-2 border-yellow-700/30 border-t-yellow-700 rounded-full"
            />
          ) : (
            <>
              <Save size={16} />
              Save Changes
            </>
          )}
        </button>
      )}

      {/* Next Button */}
      {!isLastStep && onNext && (
        <button
          type="button"
          onClick={onNext}
          disabled={saving}
          className="btn-primary px-6 py-2.5 text-sm flex items-center gap-2 disabled:opacity-60 cursor-pointer"
        >
          {saving ? (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
              className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
            />
          ) : (
            <>
              Next
              <ChevronRight size={16} />
            </>
          )}
        </button>
      )}

      {/* Complete Button */}
      {isLastStep && onComplete && (
        <button
          type="button"
          onClick={onComplete}
          disabled={saving}
          className="btn-primary px-6 py-2.5 text-sm flex items-center gap-2 disabled:opacity-60 cursor-pointer"
        >
          {saving ? (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
              className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
            />
          ) : (
            <>
              <Check size={16} />
              Complete
            </>
          )}
        </button>
      )}
    </div>
  );
};
