import './StepIndicator.css';

interface StepIndicatorProps {
  currentStep: number;
  totalSteps?: number;
}

export function StepIndicator({ currentStep, totalSteps }: StepIndicatorProps) {
  return (
    <div className="step-indicator">
      <span className="step-text">
        Step {currentStep}{totalSteps ? ` of ${totalSteps}` : ''}
      </span>
    </div>
  );
}







