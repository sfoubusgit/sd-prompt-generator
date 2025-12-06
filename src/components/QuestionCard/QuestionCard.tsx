import './QuestionCard.css';
import { InterviewNode } from '../../types/interview';
import { AnswerButton } from '../AnswerButton/AnswerButton';
import { RefinementPanel } from '../RefinementPanel/RefinementPanel';
import { WeightSlider } from '../WeightSlider/WeightSlider';
import { StepIndicator } from '../StepIndicator/StepIndicator';
import { NavigationButtons } from '../NavigationButtons/NavigationButtons';

interface QuestionCardProps {
  node: InterviewNode;
  currentStep: number;
  selectedAnswerId?: string;
  onSelectAnswer: (answerId: string) => void;
  onPrevious: () => void;
  onSuggest: () => void;
  onAdd?: () => void;
  onNext?: () => void;
  onSkip?: () => void;
  canAdd?: boolean;
  canNext?: boolean;
  refinement?: {
    node: any;
    selectedAnswerId?: string;
    onSelectAnswer: (answerId: string) => void;
  };
  weightValues: Map<string, { value: number; template: string; tags?: string[] }>;
  onWeightChange: (attrId: string, value: number, template: string, tags?: string[]) => void;
  canGoBack: boolean;
  showIntensitySlider?: boolean;
  intensityValue?: number;
  onIntensityChange?: (value: number) => void;
  sliderEnabled?: Map<string, boolean>;
  onSliderEnabledChange?: (attrId: string, enabled: boolean) => void;
  onSliderFocus?: (attrId: string, focused: boolean) => void;
  onSliderBlur?: (attrId: string, focused: boolean) => void;
  customExtension?: string;
  onCustomExtensionChange?: (extension: string) => void;
}

export function QuestionCard({
  node,
  currentStep,
  selectedAnswerId,
  onSelectAnswer,
  onPrevious,
  onSuggest,
  onAdd,
  onNext,
  onSkip,
  canAdd,
  canNext,
  refinement,
  weightValues,
  onWeightChange,
  canGoBack,
  showIntensitySlider,
  intensityValue,
  onIntensityChange,
  sliderEnabled,
  onSliderEnabledChange,
  onSliderFocus,
  onSliderBlur,
  customExtension,
  onCustomExtensionChange,
}: QuestionCardProps) {
  return (
    <div className="question-card">
      <StepIndicator currentStep={currentStep} />
      <h2 className="question-title">{node.question}</h2>
      {node.description && (
        <p className="question-description">{node.description}</p>
      )}
      {node.answers && node.answers.length > 0 && (
        <div className="question-answers">
          {node.answers.map((answer) => (
            <AnswerButton
              key={answer.id}
              label={answer.label}
              onClick={() => onSelectAnswer(answer.id)}
              isSelected={selectedAnswerId === answer.id}
            />
          ))}
        </div>
      )}
      {selectedAnswerId && onCustomExtensionChange && (
        <div className="custom-extension-container">
          <label className="custom-extension-label" htmlFor="custom-extension-input">
            Add custom extension to "{node.answers?.find(a => a.id === selectedAnswerId)?.label || 'selected answer'}":
          </label>
          <input
            id="custom-extension-input"
            type="text"
            className="custom-extension-input"
            placeholder="e.g., that has rubies attached"
            value={customExtension || ''}
            onChange={(e) => onCustomExtensionChange(e.target.value)}
            onFocus={() => onSliderFocus?.('custom-extension', true)}
            onBlur={() => onSliderBlur?.('custom-extension', false)}
          />
        </div>
      )}
      {(node.weights && node.weights.length > 0) || showIntensitySlider ? (
        <div className="question-weights">
          {node.weights && node.weights.map((weight) => {
            const currentValue = weightValues.get(weight.id);
            const enabled = sliderEnabled?.get(weight.id) === true; // Default to false - user must enable
            const isBreastSize = weight.id === 'breast_size_emphasis';
            
            // Preset values for breast size
            const breastSizePresets = [
              { label: 'Tiny', value: 1.0 },
              { label: 'Small', value: 1.1 },
              { label: 'Medium', value: 1.2 },
              { label: 'Big', value: 1.3 },
              { label: 'Huge', value: 1.5 }
            ];
            
            return (
              <div key={weight.id} className="weight-slider-container">
                <WeightSlider
                  id={weight.id}
                  label={weight.label}
                  value={currentValue?.value ?? weight.default}
                  min={weight.min}
                  max={weight.max}
                  step={weight.step}
                  onChange={(value) => onWeightChange(weight.id, value, weight.template, weight.tags)}
                  enabled={enabled}
                  onEnabledChange={onSliderEnabledChange ? (enabled) => onSliderEnabledChange(weight.id, enabled) : undefined}
                  onFocus={onSliderFocus ? () => onSliderFocus(weight.id, true) : undefined}
                  onBlur={onSliderBlur ? () => onSliderBlur(weight.id, false) : undefined}
                />
                {isBreastSize && (
                  <div className="breast-size-presets">
                    {breastSizePresets.map((preset) => {
                      const isActive = Math.abs((currentValue?.value ?? weight.default) - preset.value) < 0.01;
                      return (
                        <button
                          key={preset.label}
                          className={`breast-size-preset-button ${isActive ? 'active' : ''}`}
                          onClick={() => {
                            onWeightChange(weight.id, preset.value, weight.template, weight.tags);
                            // Auto-enable the slider when a preset is clicked
                            if (onSliderEnabledChange && !enabled) {
                              onSliderEnabledChange(weight.id, true);
                            }
                          }}
                          type="button"
                        >
                          {preset.label}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
          {showIntensitySlider && onIntensityChange !== undefined && (
            <div className="intensity-slider-wrapper">
              <WeightSlider
                id="intensity"
                label="Intensity"
                value={intensityValue ?? 1.0}
                min={-0.5}
                max={2.0}
                step={0.01}
                onChange={onIntensityChange}
                enabled={sliderEnabled?.get('intensity') === true}
                onEnabledChange={onSliderEnabledChange ? (enabled) => onSliderEnabledChange('intensity', enabled) : undefined}
                onFocus={onSliderFocus ? () => onSliderFocus('intensity', true) : undefined}
                onBlur={onSliderBlur ? () => onSliderBlur('intensity', false) : undefined}
              />
              <span className="intensity-weight-badge">Add Prompt Weight</span>
            </div>
          )}
        </div>
      ) : null}
      {refinement && (
        <RefinementPanel
          refinement={refinement.node}
          selectedAnswerId={refinement.selectedAnswerId}
          onSelectAnswer={refinement.onSelectAnswer}
          weightValues={weightValues}
          onWeightChange={onWeightChange}
          sliderEnabled={sliderEnabled}
          onSliderEnabledChange={onSliderEnabledChange}
          onSliderFocus={onSliderFocus}
          onSliderBlur={onSliderBlur}
        />
      )}
      <NavigationButtons
        onPrevious={onPrevious}
        onSuggest={onSuggest}
        onAdd={onAdd}
        onNext={onNext}
        onSkip={onSkip}
        canGoBack={canGoBack}
        canAdd={canAdd}
        canNext={canNext}
      />
    </div>
  );
}

