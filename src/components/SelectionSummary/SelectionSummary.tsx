import './SelectionSummary.css';

interface SelectionSummaryItem {
  id: string;
  nodeId: string;
  question: string;
  answerLabel: string;
}

interface SelectionSummaryProps {
  items: SelectionSummaryItem[];
  onSelectNode: (nodeId: string) => void;
  onRemoveSelection?: (selectionId: string) => void;
}

export function SelectionSummary({ items, onSelectNode, onRemoveSelection }: SelectionSummaryProps) {
  if (!items || items.length === 0) return null;

  return (
    <div className="selection-summary">
      <h3 className="summary-title">Your Selections</h3>
      <ul className="summary-list">
        {items.map(item => (
          <li 
            key={item.id} 
            className="summary-item"
          >
            <div 
              className="summary-content"
              onClick={() => onSelectNode(item.nodeId)}
            >
              <div className="summary-question">{item.question}</div>
              <div className="summary-answer">{item.answerLabel}</div>
            </div>
            {onRemoveSelection && (
              <button
                className="summary-remove"
                onClick={(e) => {
                  e.stopPropagation();
                  onRemoveSelection(item.id);
                }}
                title="Remove this selection"
              >
                ×
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

