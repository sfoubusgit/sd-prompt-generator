import { useState } from 'react';
import './CustomPromptElements.css';

interface CustomPromptElementsProps {
  customElements: Array<{ text: string; enabled: boolean; type: 'prompt' | 'negative' }>;
  onAdd: (element: string) => void;
  onRemove: (index: number) => void;
  onToggle: (index: number) => void;
  onSetType: (index: number, type: 'prompt' | 'negative') => void;
}

export function CustomPromptElements({ customElements, onAdd, onRemove, onToggle, onSetType }: CustomPromptElementsProps) {
  const [inputValue, setInputValue] = useState('');

  const handleAdd = () => {
    const trimmed = inputValue.trim();
    if (trimmed) {
      onAdd(trimmed);
      setInputValue('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleAdd();
    }
  };

  return (
    <div className="custom-prompt-elements">
      <h3 className="custom-elements-title">Custom Elements</h3>
      <div className="custom-elements-input-group">
        <input
          type="text"
          className="custom-elements-input"
          placeholder="Add your own prompt element..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={handleKeyPress}
        />
        <button
          className="custom-elements-add-button"
          onClick={handleAdd}
          disabled={!inputValue.trim()}
        >
          Add
        </button>
      </div>
      {customElements.length > 0 && (
        <ul className="custom-elements-list">
          {customElements.map((element, index) => (
            <li key={index} className="custom-elements-item">
              <div className="custom-elements-content">
                <span className={`custom-elements-text ${!element.enabled ? 'custom-elements-disabled' : ''}`}>
                  {element.text}
                </span>
                <select
                  className="custom-elements-type-select"
                  value={element.type}
                  onChange={(e) => onSetType(index, e.target.value as 'prompt' | 'negative')}
                  title="Choose prompt type"
                >
                  <option value="prompt">Main Prompt</option>
                  <option value="negative">Negative Prompt</option>
                </select>
                <button
                  className={`custom-elements-add-to-prompt ${element.enabled ? 'custom-elements-added' : ''}`}
                  onClick={() => onToggle(index)}
                  title={element.enabled ? "Remove from prompt" : "Add to prompt"}
                >
                  {element.enabled ? 'Added' : 'Add'}
                </button>
              </div>
              <button
                className="custom-elements-remove"
                onClick={() => onRemove(index)}
                title="Remove this element"
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

