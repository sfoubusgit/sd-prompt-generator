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
      {(node.weights && node.weights.length > 0) || showIntensitySlider ? (
        <div className="question-weights">
          {node.weights && node.weights.map((weight) => {
            const currentValue = weightValues.get(weight.id);
            const enabled = sliderEnabled?.get(weight.id) === true; // Default to false - user must enable
            return (
              <WeightSlider
                key={weight.id}
                id={weight.id}
                label={weight.label}
                value={currentValue?.value ?? weight.default}
                min={weight.min}
                max={weight.max}
                step={weight.step}
                onChange={(value) => onWeightChange(weight.id, value, weight.template, weight.tags)}
                enabled={enabled}
                onEnabledChange={onSliderEnabledChange ? (enabled) => onSliderEnabledChange(weight.id, enabled) : undefined}
              />
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

