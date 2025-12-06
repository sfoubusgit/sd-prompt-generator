import { useNavigate } from 'react-router-dom';
import { useInterviewEngine } from '../hooks/useInterviewEngine';
import { QuestionCard } from '../components/QuestionCard/QuestionCard';
import { PreviewPanel } from '../components/PreviewPanel/PreviewPanel';
import { SelectionSummary } from '../components/SelectionSummary/SelectionSummary';
import { CategorySidebar } from '../components/CategorySidebar/CategorySidebar';
import { CustomPromptElements } from '../components/CustomPromptElements/CustomPromptElements';
import './InterviewPage.css';

export function InterviewPage() {
  const navigate = useNavigate();
  const {
    currentNode,
    currentNodeId,
    previous,
    setWeight,
    getPreviewPrompt,
    isFinished,
    getCurrentRefinement,
    getActiveWeights,
    stepCount,
    history,
    committedAnswers,
    committedRefinements,
    weightValues,
    setWeightValues,
    tempAnswers,
    tempRefinements,
    tempIntensities,
    tempCustomExtensions,
    selectTempAnswer,
    selectTempRefinement,
    setIntensity,
    setCustomExtension,
    commitCurrentSelections,
    removeSelection,
    goToNext,
    skipToNext,
    hasTempSelectionForCurrentNode,
    hasCommittedSelectionForCurrentNode,
    jumpTo,
    jumpToCategory,
    categoryHasCommittedSelections,
    getSelectionSummary,
    reset,
    setSliderEnabled,
    enabledSliders,
    focusedSliders,
    setSliderFocused,
    customElements,
    addCustomElement,
    removeCustomElement,
    toggleCustomElement,
    setCustomElementType,
    nodeMap,
  } = useInterviewEngine();

  if (!currentNode) {
    return (
      <div className="interview-page">
        <div className="error-message">Error: Could not load interview data</div>
      </div>
    );
  }

  const preview = getPreviewPrompt();
  const currentRefinement = getCurrentRefinement();
  const activeWeights = getActiveWeights();

  // Check if current node is a refinement node (it's the refinement itself)
  const isRefinementNode = currentRefinement && currentRefinement.id === currentNode.id;
  
  // Get selected answer ID for highlighting (prefer temp, then committed)
  const tempAnswer = tempAnswers.get(currentNodeId);
  const committedAnswer = committedAnswers.find(a => a.nodeId === currentNodeId);
  const selectedAnswerId = tempAnswer?.answerId ?? committedAnswer?.answerId;
  // Get custom extension from tempCustomExtensions map (raw value with spaces) or from committed answer
  // Check if the key exists in the map first (even if value is empty string)
  const tempCustomExt = tempCustomExtensions?.has(currentNodeId) 
    ? (tempCustomExtensions.get(currentNodeId) ?? '')
    : undefined;
  const currentCustomExtension = tempCustomExt !== undefined 
    ? tempCustomExt 
    : (tempAnswer?.customExtension ?? committedAnswer?.customExtension ?? '');
  
  // Get selected refinement answer ID (prefer temp, then committed)
  const tempRefinement = tempRefinements.get(currentNodeId);
  const committedRefinement = currentRefinement 
    ? committedRefinements.find(r => r.refinementId === currentRefinement.id)
    : undefined;
  // Get custom extension from tempCustomExtensions map (raw value with spaces) or from committed refinement
  // Check if the key exists in the map first (even if value is empty string)
  const tempRefinementCustomExt = tempCustomExtensions?.has(currentNodeId)
    ? (tempCustomExtensions.get(currentNodeId) ?? '')
    : undefined;
  const currentRefinementCustomExtension = tempRefinementCustomExt !== undefined
    ? tempRefinementCustomExt
    : (tempRefinement?.customExtension ?? committedRefinement?.customExtension ?? '');
  const selectedRefinementAnswerId = tempRefinement?.answerId ?? committedRefinement?.answerId;

  const handleWeightChange = (attrId: string, value: number, template: string, tags?: string[]) => {
    setWeight(attrId, value, template, tags);
  };

  const handleIntensityChange = (value: number) => {
    setIntensity(currentNodeId, value);
    
    // If there's a committed selection, update its intensity weight directly
    const committedAnswer = committedAnswers.find(a => a.nodeId === currentNodeId);
    const committedRefinement = currentRefinement 
      ? committedRefinements.find(r => r.refinementId === currentRefinement.id)
      : undefined;
    
    const committedId = committedAnswer?.id ?? committedRefinement?.id;
    if (committedId) {
      // Update the intensity weight for the committed selection
      const intensityWeightId = `weight-${committedId}-intensity`;
      setWeightValues(prev => {
        const m = new Map(prev);
        const existing = m.get(intensityWeightId);
        if (existing) {
          m.set(intensityWeightId, {
            ...existing,
            value,
          });
        }
        return m;
      });
    }
  };
  
  // Get intensity value for current node (temp, committed, or default to 1.0, can be negative)
  let currentIntensity = tempIntensities.get(currentNodeId);
  if (currentIntensity === undefined) {
    // Check for committed intensity
    const committedAnswer = committedAnswers.find(a => a.nodeId === currentNodeId);
    const committedRefinement = currentRefinement 
      ? committedRefinements.find(r => r.refinementId === currentRefinement.id)
      : undefined;
    
    const committedId = committedAnswer?.id ?? committedRefinement?.id;
    if (committedId) {
      const intensityWeightId = `weight-${committedId}-intensity`;
      const intensityWeight = weightValues.get(intensityWeightId);
      currentIntensity = intensityWeight?.value ?? 1.0;
    } else {
      currentIntensity = 1.0;
    }
  }
  
  // Check if current question is a yes/no question (navigation question)
  // These questions ask "Would you like...", "Do you want...", etc. and shouldn't show intensity slider
  const isYesNoQuestion = currentNode && (
    currentNode.question.toLowerCase().includes('would you like') ||
    currentNode.question.toLowerCase().includes('do you want') ||
    currentNode.question.toLowerCase().includes('would you') ||
    (currentNode.answers && currentNode.answers.length === 2 && 
     currentNode.answers.some(a => a.label.toLowerCase() === 'yes') && 
     currentNode.answers.some(a => a.label.toLowerCase() === 'no'))
  );
  
  // Check if current question is a navigation question asking "What is the X?", "What X would you like to adjust?", or "Which X would you like to configure?"
  // These are category selection questions where you choose which aspect to configure
  // Examples: "What is the character's body type?" (selects Height/Build/Posture)
  // Examples: "What body attribute would you like to adjust?" (selects Height/Build/Posture/NSFW)
  // Examples: "Which NSFW attribute would you like to configure?" (selects Nudity/Breasts/Vagina/etc.)
  // But NOT: "What is the character's build?" (selects Slim/Athletic/etc.)
  // Detection: questions asking "What is the [something]?", "What X would you like to adjust?", or "Which X would you like to configure?"
  // Navigation questions typically have "-root" suffix (e.g., "character-body-root") or are options menus (e.g., "nsfw-options")
  // vs actual selection questions (e.g., "character-build")
  const questionLower = currentNode?.question.toLowerCase() || '';
  const isNavigationQuestion = currentNode && (
    (currentNodeId.endsWith('-root') || currentNodeId.endsWith('-options')) && (
      questionLower.match(/^what is the .+\?$/) ||
      questionLower.match(/what .+ would you like to (adjust|configure|select|choose)\?$/) ||
      questionLower.match(/which .+ would you like to (adjust|configure|select|choose)\?$/)
    )
  );
  
  // Show intensity slider if there's a selection (temp or committed), but not on:
  // - root question
  // - yes/no questions (navigation questions)
  // - navigation questions asking "What is the X?" (category selection)
  const showIntensity = (hasTempSelectionForCurrentNode || hasCommittedSelectionForCurrentNode) && 
                        currentNodeId !== 'root' && 
                        !isYesNoQuestion &&
                        !isNavigationQuestion;

  const handleSuggest = () => {
    // Auto-select first answer if available (as temp selection)
    if (currentNode.answers && currentNode.answers.length > 0) {
      selectTempAnswer(currentNode.answers[0].id);
    }
  };

  // Determine if NEXT can be enabled (needs a navigation answer)
  // Also allow Next if there are weights but no answers (like NSFW weight-only nodes)
  const hasWeightsOnly = currentNode && currentNode.weights && currentNode.weights.length > 0 && (!currentNode.answers || currentNode.answers.length === 0);
  const canGoToNext = hasCommittedSelectionForCurrentNode || hasTempSelectionForCurrentNode || hasWeightsOnly;
  
  // Determine if ADD can be enabled (needs temp selection, modified weights, or slider interaction)
  const hasModifiedWeights = currentNode && currentNode.weights && currentNode.weights.some(w => {
    const tempWeight = weightValues.get(w.id);
    // Check if weight has been modified from default (either exists and differs, or doesn't exist but should be checked)
    if (tempWeight) {
      return Math.abs(tempWeight.value - w.default) > 0.001; // Use small epsilon for float comparison
    }
    return false;
  });
  
  // Check if any slider is enabled (checkbox checked) or focused
  const hasEnabledSliders = currentNode && (
    (currentNode.weights && currentNode.weights.some(w => enabledSliders.get(w.id) === true)) ||
    (showIntensity && enabledSliders.get('intensity') === true)
  );
  const hasFocusedSliders = focusedSliders.size > 0;
  
  const canAdd = hasTempSelectionForCurrentNode || hasModifiedWeights || hasEnabledSliders || hasFocusedSliders;

  // Merge weight values from both node and refinement
  // Create a compatible map for components (they only need value, template, tags)
  const allWeightValues = new Map<string, { value: number; template: string; tags?: string[] }>();
  
  // Add existing weight values (only uncommitted ones for current editing)
  weightValues.forEach((w, key) => {
    if (!w.associatedAnswerId) {
      allWeightValues.set(w.attrId, {
        value: w.value,
        template: w.template,
        tags: w.tags,
      });
    }
  });
  
  // Add default weights for current node if not already set
  if (currentNode.weights) {
    currentNode.weights.forEach((weight) => {
      if (!allWeightValues.has(weight.id)) {
        allWeightValues.set(weight.id, {
          value: weight.default,
          template: weight.template,
          tags: weight.tags,
        });
      }
    });
  }
  
  // Add default weights for current refinement if not already set
  if (currentRefinement?.weights) {
    currentRefinement.weights.forEach((weight) => {
      if (!allWeightValues.has(weight.id)) {
        allWeightValues.set(weight.id, {
          value: weight.default,
          template: weight.template,
          tags: weight.tags,
        });
      }
    });
  }

  const summary = getSelectionSummary();

  return (
    <div className="interview-page">
      <button 
        className="tutorial-button"
        onClick={() => navigate('/tutorial')}
        title="Open Tutorial"
      >
        📖 Tutorial
      </button>
      <div className="interview-layout">
        <CategorySidebar
          onSelectCategory={(nodeId) => jumpToCategory(nodeId)}
          hasCommitted={(categoryNodes) => categoryHasCommittedSelections(categoryNodes)}
          currentNodeId={currentNodeId}
          nodeMap={nodeMap}
        />
        <div className="interview-container">
          <div className="interview-left">
            {isRefinementNode ? (
              // Show refinement as main question
              <QuestionCard
                node={currentRefinement as any}
                currentStep={stepCount}
                selectedAnswerId={selectedRefinementAnswerId}
                onSelectAnswer={selectTempRefinement}
                onPrevious={previous}
                onSuggest={handleSuggest}
                onAdd={(isNavigationQuestion || isYesNoQuestion) ? undefined : commitCurrentSelections}
                onNext={goToNext}
                onSkip={skipToNext}
                canAdd={canAdd}
                canNext={canGoToNext}
                weightValues={allWeightValues}
                onWeightChange={handleWeightChange}
                canGoBack={history.length > 1}
                showIntensitySlider={showIntensity}
                intensityValue={currentIntensity}
                onIntensityChange={handleIntensityChange}
                sliderEnabled={enabledSliders}
                onSliderEnabledChange={setSliderEnabled}
                onSliderFocus={setSliderFocused}
                onSliderBlur={setSliderFocused}
                customExtension={currentRefinementCustomExtension}
                onCustomExtensionChange={(ext) => setCustomExtension(currentNodeId, ext)}
              />
            ) : (
              <QuestionCard
                node={currentNode}
                currentStep={stepCount}
                selectedAnswerId={selectedAnswerId}
                onSelectAnswer={selectTempAnswer}
                onPrevious={previous}
                onSuggest={handleSuggest}
                onAdd={(isNavigationQuestion || isYesNoQuestion) ? undefined : commitCurrentSelections}
                onNext={goToNext}
                onSkip={skipToNext}
                canAdd={canAdd}
                canNext={canGoToNext}
                refinement={
                  currentRefinement && !isRefinementNode
                    ? {
                        node: currentRefinement,
                        selectedAnswerId: selectedRefinementAnswerId,
                        onSelectAnswer: selectTempRefinement,
                      }
                    : undefined
                }
                weightValues={allWeightValues}
                onWeightChange={handleWeightChange}
                canGoBack={history.length > 1}
                showIntensitySlider={showIntensity}
                intensityValue={currentIntensity}
                onIntensityChange={handleIntensityChange}
                sliderEnabled={enabledSliders}
                onSliderEnabledChange={setSliderEnabled}
                onSliderFocus={setSliderFocused}
                onSliderBlur={setSliderFocused}
                customExtension={currentCustomExtension}
                onCustomExtensionChange={(ext) => setCustomExtension(currentNodeId, ext)}
              />
            )}
          </div>
        <div className="interview-right">
          <PreviewPanel
            prompt={preview.prompt}
            negativePrompt={preview.negativePrompt}
            isFinished={isFinished()}
            onReset={reset}
          />
          <SelectionSummary 
            items={summary} 
            onSelectNode={(nodeId) => jumpTo(nodeId)}
            onRemoveSelection={removeSelection}
          />
          <CustomPromptElements
            customElements={customElements}
            onAdd={addCustomElement}
            onRemove={removeCustomElement}
            onToggle={toggleCustomElement}
            onSetType={setCustomElementType}
          />
        </div>
      </div>
      </div>
    </div>
  );
}

