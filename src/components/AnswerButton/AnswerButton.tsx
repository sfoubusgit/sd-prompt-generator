import './AnswerButton.css';

interface AnswerButtonProps {
  label: string;
  onClick: () => void;
  isSelected?: boolean;
}

export function AnswerButton({ label, onClick, isSelected }: AnswerButtonProps) {
  return (
    <button
      className={`answer-button ${isSelected ? 'selected' : ''}`}
      onClick={onClick}
    >
      {label}
    </button>
  );
}







