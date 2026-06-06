// components/product/create/StepIndicator.tsx
import { ReactNode } from "react";
import { Check, Edit2 } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export interface Step {
  key: string;
  label: string;
  icon: ReactNode;
}

interface StepIndicatorProps {
  steps: Step[];
  currentStep: string;
  completedSteps: string[];
  hasChanges?: Record<string, boolean>;
  onStepClick: (stepKey: string) => void;
}

export const StepIndicator = ({
  steps,
  currentStep,
  completedSteps,
  hasChanges = {},
  onStepClick,
}: StepIndicatorProps) => {
  const currentIndex = steps.findIndex((s) => s.key === currentStep);

  return (
    <div className="flex items-center justify-between bg-white rounded-xl p-2 border border-gray-100">
      {steps.map((step, idx) => {
        const isCompleted = completedSteps.includes(step.key);
        const hasUnsavedChanges = hasChanges[step.key];

        return (
          <div
            key={step.key}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg transition-all cursor-pointer",
              currentStep === step.key
                ? "bg-primary text-white"
                : isCompleted && idx < currentIndex
                ? hasUnsavedChanges
                  ? "bg-yellow-50 text-yellow-700"
                  : "bg-green-50 text-green-700"
                : "text-gray-400 hover:bg-gray-50",
            )}
            onClick={() => {
              if (idx <= currentIndex) {
                onStepClick(step.key);
              }
            }}
          >
            {isCompleted && idx < currentIndex && !hasUnsavedChanges && (
              <Check size={14} />
            )}
            {isCompleted && idx < currentIndex && hasUnsavedChanges && (
              <Edit2 size={14} />
            )}
            {step.icon}
            <span className="text-sm font-medium">{step.label}</span>
            {hasUnsavedChanges && isCompleted && idx < currentIndex && (
              <span className="text-xs ml-1">(edited)</span>
            )}
          </div>
        );
      })}
    </div>
  );
};
