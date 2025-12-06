import './RefinementPanel.css';
import { RefinementNode } from '../../types/interview';
import { AnswerButton } from '../AnswerButton/AnswerButton';
import { WeightSlider } from '../WeightSlider/WeightSlider';

interface RefinementPanelProps {
  refinement: RefinementNode;
  selectedAnswerId?: string;
  onSelectAnswer: (answerId: string) => void;
  weightValues: Map<string, { value: number; template: string; tags?: string[] }>;
  onWeightChange: (attrId: string, value: number, template: string, tags?: string[]) => void;
  sliderEnabled?: Map<string, boolean>;
  onSliderEnabledChange?: (attrId: string, enabled: boolean) => void;
  onSliderFocus?: (attrId: string, focused: boolean) => void;
  onSliderBlur?: (attrId: string, focused: boolean) => void;
}

export function RefinementPanel({
  refinement,
  selectedAnswerId,
  onSelectAnswer,
  weightValues,
  onWeightChange,
  sliderEnabled,
  onSliderEnabledChange,
  onSliderFocus,
  onSliderBlur,
}: RefinementPanelProps) {
  return (
    <div className="refinement-panel">
      <h3 className="refinement-question">{refinement.question}</h3>
      <div className="refinement-answers">
        {refinement.answers.map((answer) => (
          <AnswerButton
            key={answer.id}
            label={answer.label}
            onClick={() => onSelectAnswer(answer.id)}
            isSelected={selectedAnswerId === answer.id}
          />
        ))}
      </div>
      {refinement.weights && refinement.weights.length > 0 && (
        <div className="refinement-weights">
          {refinement.weights.map((weight) => {
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
                onFocus={onSliderFocus ? () => onSliderFocus(weight.id, true) : undefined}
                onBlur={onSliderBlur ? () => onSliderBlur(weight.id, false) : undefined}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}



