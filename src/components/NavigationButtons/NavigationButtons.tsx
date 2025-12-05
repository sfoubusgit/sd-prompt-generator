import './NavigationButtons.css';

interface NavigationButtonsProps {
  onPrevious: () => void;
  onSuggest: () => void;
  onAdd?: () => void;
  onNext?: () => void;
  onSkip?: () => void;
  canGoBack: boolean;
  canAdd?: boolean;
  canNext?: boolean;
}

export function NavigationButtons({ onPrevious, onSuggest, onAdd, onNext, onSkip, canGoBack, canAdd, canNext }: NavigationButtonsProps) {
  return (
    <div className="navigation-buttons">
      <button
        className="nav-button nav-button-back"
        onClick={onPrevious}
        disabled={!canGoBack}
      >
        ← Back
      </button>
      {onSkip && (
        <button
          className="nav-button nav-button-skip"
          onClick={onSkip}
        >
          Skip →
        </button>
      )}
      {onAdd && (
        <button
          className="nav-button nav-button-add"
          onClick={onAdd}
          disabled={!canAdd}
        >
          Add
        </button>
      )}
      {onNext ? (
        <button
          className="nav-button nav-button-next"
          onClick={onNext}
          disabled={!canNext}
        >
          Next →
        </button>
      ) : (
        <button
          className="nav-button nav-button-suggest"
          onClick={onSuggest}
        >
          Suggest for Me
        </button>
      )}
    </div>
  );
}

