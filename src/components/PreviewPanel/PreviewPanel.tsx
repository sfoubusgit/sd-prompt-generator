import './PreviewPanel.css';

interface PreviewPanelProps {
  prompt: string;
  negativePrompt: string;
  isFinished: boolean;
  onReset?: () => void;
}

export function PreviewPanel({ prompt, negativePrompt, isFinished, onReset }: PreviewPanelProps) {
  const handleCopy = () => {
    const fullPrompt = `${prompt}\n\nNegative prompt: ${negativePrompt}`;
    navigator.clipboard.writeText(fullPrompt).then(() => {
      // You could add a toast notification here
      alert('Prompt copied to clipboard!');
    }).catch((err) => {
      console.error('Failed to copy:', err);
    });
  };

  return (
    <div className="preview-panel">
      <div className="preview-header">
        <h3 className="preview-title">Prompt Preview</h3>
        <div className="preview-header-actions">
          {isFinished && (
            <span className="preview-badge">Complete</span>
          )}
          {onReset && (
            <button className="preview-reset-button" onClick={onReset} title="Reset all selections">
              Reset
            </button>
          )}
        </div>
      </div>
      <div className="preview-content">
        <div className="preview-section">
          <label className="preview-label">Prompt</label>
          <div className="preview-text prompt-text">
            {prompt || 'Start answering questions to build your prompt...'}
          </div>
        </div>
        <div className="preview-section">
          <label className="preview-label">Negative Prompt</label>
          <div className="preview-text negative-prompt-text">
            {negativePrompt}
          </div>
        </div>
      </div>
      {isFinished && prompt && (
        <button className="preview-copy-button" onClick={handleCopy}>
          Copy Prompt
        </button>
      )}
    </div>
  );
}

