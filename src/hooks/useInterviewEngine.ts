import { useState, useCallback, useMemo } from 'react';
import { InterviewNode, RefinementNode } from '../types/interview';
import { assemblePrompt, SelectedAnswer, SelectedRefinement, WeightValue } from '../services/promptAssembler';

// Load all JSON files recursively from all subdirectories
const interviewFiles = import.meta.glob('/src/data/interview/**/*.json', { eager: true });

// Build node map
const nodeMap = new Map<string, InterviewNode | RefinementNode>();

Object.values(interviewFiles).forEach((module: any) => {
  // JSON files are imported as default exports in Vite
  const data = module.default ?? module;
  if (Array.isArray(data)) {
    data.forEach((node: InterviewNode | RefinementNode) => {
      nodeMap.set(node.id, node);
    });
  } else if (data && data.id) {
    nodeMap.set(data.id, data);
  }
});

export function useInterviewEngine() {
  const [currentNodeId, setCurrentNodeId] = useState<string>('root');
  const [history, setHistory] = useState<string[]>(['root']);
  
  // Temporary selections for current screen (one per nodeId)
  const [tempAnswers, setTempAnswers] = useState<Map<string, SelectedAnswer>>(new Map());
  const [tempRefinements, setTempRefinements] = useState<Map<string, SelectedRefinement>>(new Map());
  
  // Committed selections used to build the prompt (array to allow multiple)
  const [committedAnswers, setCommittedAnswers] = useState<SelectedAnswer[]>([]);
  const [committedRefinements, setCommittedRefinements] = useState<SelectedRefinement[]>([]);
  const [weightValues, setWeightValues] = useState<Map<string, WeightValue>>(new Map());
  
  // Intensity values for temp selections (keyed by nodeId)
  const [tempIntensities, setTempIntensities] = useState<Map<string, number>>(new Map());
  
  // Track which weights have been modified (touched) from their defaults
  const [touchedWeights, setTouchedWeights] = useState<Set<string>>(new Set());
  
  // Track which sliders are enabled (checked) - ALL SLIDERS ARE DISABLED BY DEFAULT
  // Users must explicitly check the checkbox to enable any slider
  const [enabledSliders, setEnabledSliders] = useState<Map<string, boolean>>(new Map());
  
  // Track which sliders are currently focused (for Add button activation)
  const [focusedSliders, setFocusedSliders] = useState<Set<string>>(new Set());
  
  // Custom prompt elements added by user (with enabled state and prompt type)
  const [customElements, setCustomElements] = useState<Array<{ text: string; enabled: boolean; type: 'prompt' | 'negative' }>>([]);
  
  // Custom extensions for temp answers (keyed by nodeId)
  const [tempCustomExtensions, setTempCustomExtensions] = useState<Map<string, string>>(new Map());

  const currentNode = nodeMap.get(currentNodeId) as InterviewNode | undefined;

  const selectTempAnswer = useCallback(
    (answerId: string) => {
      if (!currentNode || !currentNode.answers) return;

      const answer = currentNode.answers.find(a => a.id === answerId);
      if (!answer) return;

      setTempAnswers(prev => {
        const m = new Map(prev);
        // One temp answer per node (simpler behavior)
        m.set(currentNodeId, {
          id: `temp-${currentNodeId}-${answerId}`, // Temporary ID
          nodeId: currentNodeId,
          answerId: answer.id,
          label: answer.label,
          questionText: currentNode.question, // Store question text for context
        });
        return m;
      });
    },
    [currentNode, currentNodeId]
  );

  const selectTempRefinement = useCallback(
    (answerId: string) => {
      if (!currentNode || !currentNode.answers) return;

      const answer = currentNode.answers.find(a => a.id === answerId);
      if (!answer) return;

      setTempRefinements(prev => {
        const m = new Map(prev);
        const existingRefinement = m.get(currentNodeId);
        const customExtension = existingRefinement?.customExtension || tempCustomExtensions.get(currentNodeId);
        m.set(currentNodeId, {
          id: `temp-${currentNodeId}-${answerId}`, // Temporary ID
          refinementId: currentNodeId,
          answerId: answer.id,
          label: answer.label,
          questionText: currentNode.question, // Store question text for context
          customExtension: customExtension, // Preserve custom extension if it exists
        });
        return m;
      });
      
      // Initialize intensity to 1.0 if not already set (can be negative)
      setTempIntensities(prev => {
        const m = new Map(prev);
        if (!m.has(currentNodeId)) {
          m.set(currentNodeId, 1.0);
        }
        return m;
      });
    },
    [currentNode, currentNodeId]
  );

  const commitCurrentSelections = useCallback(() => {
    const tempAnswer = tempAnswers.get(currentNodeId);
    const tempRefinement = tempRefinements.get(currentNodeId);
    
    let committedAnswerId: string | undefined;
    let answerLabel: string | undefined;
    
    if (tempAnswer) {
      // Generate unique ID for this committed selection
      committedAnswerId = `sel-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      answerLabel = tempAnswer.label;
      
      setCommittedAnswers(prev => {
        const rawExtension = tempAnswer.customExtension || tempCustomExtensions.get(currentNodeId);
        const customExtension = rawExtension ? rawExtension.trim() : undefined;
        return [...prev, {
          ...tempAnswer,
          id: committedAnswerId!,
          customExtension: customExtension,
        }];
      });
    }

    if (tempRefinement) {
      // Generate unique ID for this committed selection
      const newId = `sel-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      if (!answerLabel) {
        answerLabel = tempRefinement.label;
      }
      
      setCommittedRefinements(prev => {
        const rawExtension = tempRefinement.customExtension || tempCustomExtensions.get(currentNodeId);
        const customExtension = rawExtension ? rawExtension.trim() : undefined;
        return [...prev, {
          ...tempRefinement,
          id: newId,
          customExtension: customExtension,
        }];
      });
    }

        // Commit intensity as a weight for the selected answer (but NOT for root question)
        // Root question answers should not have intensity weights
        // Also skip if intensity slider is disabled
        if (currentNodeId !== 'root') {
          const intensityEnabled = enabledSliders.get('intensity') === true; // Default to false - user must enable
          if (intensityEnabled) {
        const intensity = tempIntensities.get(currentNodeId) ?? 1.0;
        // For effects nodes, allow intensity even without an answer (use question context)
        // For other nodes, require an answer
        const isEffectsNode = currentNodeId.startsWith('effects-');
        if (isEffectsNode || (committedAnswerId && answerLabel)) {
          // Use answer label if available, otherwise use question context
          let intensityLabel = answerLabel;
          let intensityAnswerId = committedAnswerId;
          
          if (!intensityLabel && currentNode) {
            // Extract context from question for effects nodes
            const question = currentNode.question.toLowerCase();
            // Pattern: "How intense should the X be?" -> use "X"
            let match = question.match(/how .+ should the (.+?) be\?$/);
            if (!match) {
              match = question.match(/how .+ should (.+?) be\?$/);
            }
            if (match && match[1]) {
              intensityLabel = match[1].trim();
            } else {
              // Fallback: use a generic label based on node ID
              intensityLabel = currentNodeId.replace('effects-', '').replace(/-/g, ' ');
            }
            // Create a synthetic answer ID for effects nodes without answers
            intensityAnswerId = `intensity-${currentNodeId}`;
          }
          
          if (intensityLabel) {
            const intensityWeightId = isEffectsNode && !committedAnswerId 
              ? `weight-${currentNodeId}-intensity`
              : `weight-${intensityAnswerId}-intensity`;
            setWeightValues(prev => {
              const m = new Map(prev);
              m.set(intensityWeightId, {
                id: intensityWeightId,
                attrId: 'intensity',
                value: intensity,
                template: 'intensity',
                tags: undefined,
                associatedAnswerId: intensityAnswerId,
                answerLabel: intensityLabel!,
                questionText: currentNode?.question, // Store question text for context
              });
              return m;
            });
          }
        }
      }
    }

    // Commit weights for this node
    if (currentNode) {
      // Get all weights for current node
      const nodeWeights = currentNode.weights || [];
      
      // Check for refinement weights on current node
      let refinementWeights: any[] = [];
      if (currentNode.refinements) {
        for (const refinement of currentNode.refinements) {
          if (refinement.weights) {
            refinementWeights.push(...refinement.weights);
          }
        }
      }
      
      // Also check if current node is a refinement node itself
      if (currentNodeId.startsWith('refine-')) {
        const refinementNode = nodeMap.get(currentNodeId) as RefinementNode | undefined;
        if (refinementNode?.weights) {
          refinementWeights.push(...refinementNode.weights);
        }
      }
      
      const allWeights = [...nodeWeights, ...refinementWeights];
      
      // Find the most recent committed answer from previous nodes in the flow to provide context
      // This ensures weights like "augmentations" get contextualized with "Augmentations"
      // BUT: For weight-only nodes (nodes with weights but no answers), don't use contextual answers
      // Weight-only nodes should have standalone weights without answer prefixes
      const isWeightOnlyNode = !currentNode.answers || currentNode.answers.length === 0;
      
      let contextualAnswerId: string | undefined;
      let contextualAnswerLabel: string | undefined;
      
      // Only look for contextual answers if this is NOT a weight-only node
      if (!isWeightOnlyNode && !committedAnswerId && history.length > 1) {
        // Look back through history to find the most recent committed answer
        for (let i = history.length - 2; i >= 0; i--) {
          const prevNodeId = history[i];
          const prevAnswer = committedAnswers.find(a => a.nodeId === prevNodeId);
          if (prevAnswer) {
            contextualAnswerId = prevAnswer.id;
            contextualAnswerLabel = prevAnswer.label;
            break;
          }
          const prevRefinement = committedRefinements.find(r => r.refinementId === prevNodeId);
          if (prevRefinement) {
            contextualAnswerId = prevRefinement.id;
            contextualAnswerLabel = prevRefinement.label;
            break;
          }
        }
      }
      
      // Use current answer if available, otherwise use contextual answer from previous node
      // BUT: For weight-only nodes, never use contextual answers - keep weights standalone
      const finalAnswerId = isWeightOnlyNode ? committedAnswerId : (committedAnswerId || contextualAnswerId);
      const finalAnswerLabel = isWeightOnlyNode ? answerLabel : (answerLabel || contextualAnswerLabel);
      
      // If there's a committed answer, associate weights with it
      // Otherwise, commit weights standalone (for nodes with only weights, no answers)
      allWeights.forEach(weightAttr => {
        // Skip disabled sliders (if checkbox is unchecked)
        const isEnabled = enabledSliders.get(weightAttr.id) === true; // Default to false - user must enable
        if (!isEnabled) {
          return;
        }
        
        // Always commit weights if they've been touched, OR if there's any answer (current or contextual)
        // This ensures weights are included when user moves slider and clicks Add
        const shouldCommit = touchedWeights.has(weightAttr.id) || finalAnswerId;
        if (!shouldCommit) {
          return;
        }
        
        // Check for weight value - could be stored with attrId as key or temp key
        let currentWeight = weightValues.get(weightAttr.id);
        if (!currentWeight) {
          // Try to find by attrId in any weight (look for temp weights)
          const found = Array.from(weightValues.entries()).find(([key, w]) => 
            w.attrId === weightAttr.id && !w.associatedAnswerId
          );
          if (found) {
            currentWeight = found[1];
          }
        }
        
        if (finalAnswerId && finalAnswerLabel) {
          // Associate weight with the answer (current or contextual)
          const weightId = `weight-${finalAnswerId}-${weightAttr.id}`;
          const weightValue = currentWeight ? currentWeight.value : weightAttr.default;
          const weightTags = currentWeight ? currentWeight.tags : weightAttr.tags;
          
          setWeightValues(prev => {
            const m = new Map(prev);
            m.set(weightId, {
              id: weightId,
              attrId: weightAttr.id,
              value: weightValue,
              template: weightAttr.template,
              tags: weightTags,
              associatedAnswerId: finalAnswerId,
              answerLabel: finalAnswerLabel,
            });
            return m;
          });
        } else {
          // Commit weight standalone (no answer associated at all)
          // Generate a unique ID for this standalone weight
          const standaloneWeightId = `weight-standalone-${Date.now()}-${Math.random().toString(36).substr(2, 9)}-${weightAttr.id}`;
          const weightValue = currentWeight ? currentWeight.value : weightAttr.default;
          const weightTags = currentWeight ? currentWeight.tags : weightAttr.tags;
          
          setWeightValues(prev => {
            const m = new Map(prev);
            m.set(standaloneWeightId, {
              id: standaloneWeightId,
              attrId: weightAttr.id,
              value: weightValue,
              template: weightAttr.template,
              tags: weightTags,
              associatedAnswerId: undefined,
              answerLabel: undefined, // No answer label for truly standalone weights
            });
            return m;
          });
        }
      });
    }

    // Clear temp selections after committing
    setTempAnswers(prev => {
      const m = new Map(prev);
      m.delete(currentNodeId);
      return m;
    });

    setTempRefinements(prev => {
      const m = new Map(prev);
      m.delete(currentNodeId);
      return m;
    });
    
    // Clear temp intensity after committing
    setTempIntensities(prev => {
      const m = new Map(prev);
      m.delete(currentNodeId);
      return m;
    });
    
    // Clear touched weights for current node after committing
    if (currentNode) {
      const nodeWeights = currentNode.weights || [];
      setTouchedWeights(prev => {
        const newSet = new Set(prev);
        nodeWeights.forEach(w => newSet.delete(w.id));
        return newSet;
      });
    }
  }, [currentNodeId, tempAnswers, tempRefinements, tempIntensities, currentNode, weightValues, nodeMap, touchedWeights, enabledSliders, history, committedAnswers, committedRefinements]);

  const skipToNext = useCallback(() => {
    if (!currentNode) return;

    // Handle weight-only nodes (no answers) - navigate back to options
    if ((!currentNode.answers || currentNode.answers.length === 0) && currentNodeId.startsWith('nsfw-') && currentNodeId !== 'nsfw-options') {
      // Navigate back to NSFW options menu
      const nextId = 'nsfw-options';
      setHistory(prev => [...prev, nextId]);
      setCurrentNodeId(nextId);
      
      // Clear temp selections when skipping
      setTempAnswers(prev => {
        const m = new Map(prev);
        m.delete(currentNodeId);
        return m;
      });
      setTempRefinements(prev => {
        const m = new Map(prev);
        m.delete(currentNodeId);
        return m;
      });
      setTempIntensities(prev => {
        const m = new Map(prev);
        m.delete(currentNodeId);
        return m;
      });
      
      // Clear intensity slider enabled state when skipping
      setEnabledSliders(prev => {
        const m = new Map(prev);
        m.delete('intensity');
        return m;
      });
      return;
    }

    // If there are answers, go to the first answer's next node
    if (currentNode.answers && currentNode.answers.length > 0) {
      const firstAnswer = currentNode.answers[0];
      if (firstAnswer.next) {
        const nextId = firstAnswer.next;
        setHistory(prev => [...prev, nextId]);
        setCurrentNodeId(nextId);
        
        // Clear temp selections when skipping
        setTempAnswers(prev => {
          const m = new Map(prev);
          m.delete(currentNodeId);
          return m;
        });
        setTempRefinements(prev => {
          const m = new Map(prev);
          m.delete(currentNodeId);
          return m;
        });
        setTempIntensities(prev => {
          const m = new Map(prev);
          m.delete(currentNodeId);
          return m;
        });
        
        // Clear intensity slider enabled state when skipping
        setEnabledSliders(prev => {
          const m = new Map(prev);
          m.delete('intensity');
          return m;
        });
        return;
      }
    }

    // If there are refinements, skip to the first refinement
    if (currentNode.refinements && currentNode.refinements.length > 0) {
      const firstRefinement = currentNode.refinements[0];
      if (firstRefinement.id) {
        const nextId = firstRefinement.id;
        setHistory(prev => [...prev, nextId]);
        setCurrentNodeId(nextId);
        
        // Clear temp selections when skipping
        setTempAnswers(prev => {
          const m = new Map(prev);
          m.delete(currentNodeId);
          return m;
        });
        setTempRefinements(prev => {
          const m = new Map(prev);
          m.delete(currentNodeId);
          return m;
        });
        setTempIntensities(prev => {
          const m = new Map(prev);
          m.delete(currentNodeId);
          return m;
        });
        
        // Clear intensity slider enabled state when skipping
        setEnabledSliders(prev => {
          const m = new Map(prev);
          m.delete('intensity');
          return m;
        });
        return;
      }
    }
  }, [currentNode, currentNodeId, history, nodeMap]);

  const goToNext = useCallback(() => {
    if (!currentNode) return;

    // Handle weight-only nodes (no answers) - navigate back to options
    // This applies to NSFW weight-only nodes like nsfw-breasts, nsfw-vagina, etc.
    const hasNoAnswers = !currentNode.answers || currentNode.answers.length === 0;
    if (hasNoAnswers && currentNodeId.startsWith('nsfw-') && currentNodeId !== 'nsfw-options') {
      // Navigate back to NSFW options menu
      const nextId = 'nsfw-options';
      if (nodeMap.has(nextId)) {
        setHistory(prev => [...prev, nextId]);
        setCurrentNodeId(nextId);
        
        // Clear temp selections when moving to next node
        setTempAnswers(prev => {
          const m = new Map(prev);
          m.delete(currentNodeId);
          return m;
        });
        setTempRefinements(prev => {
          const m = new Map(prev);
          m.delete(currentNodeId);
          return m;
        });
        setTempIntensities(prev => {
          const m = new Map(prev);
          m.delete(currentNodeId);
          return m;
        });
        return;
      }
    }

    // If there are no answers at all (and not an NSFW weight-only node), we can't navigate
    if (hasNoAnswers) {
      return;
    }

    // Prefer committed answer for navigation; fallback to temp
    // Check if there's a committed answer for this node
    const committedForNode = committedAnswers.find(a => a.nodeId === currentNodeId);
    const temp = tempAnswers.get(currentNodeId);

    const navAnswerSource = committedForNode ?? temp;
    if (!navAnswerSource || !currentNode.answers) return;

    const answer = currentNode.answers.find(a => a.id === navAnswerSource.answerId);
    if (!answer || !answer.next) return;

    const nextId = answer.next;

    setHistory(prev => [...prev, nextId]);
    setCurrentNodeId(nextId);
    
    // Clear temp selections when moving to next node
    setTempAnswers(prev => {
      const m = new Map(prev);
      m.delete(currentNodeId);
      return m;
    });
    setTempRefinements(prev => {
      const m = new Map(prev);
      m.delete(currentNodeId);
      return m;
    });
    setTempIntensities(prev => {
      const m = new Map(prev);
      m.delete(currentNodeId);
      return m;
    });
    
    // Clear focused sliders when navigating to new node
    setFocusedSliders(new Set());
    
    // Clear intensity slider enabled state when navigating to new node
    // (intensity slider should always be disabled by default on each new node)
    setEnabledSliders(prev => {
      const m = new Map(prev);
      m.delete('intensity');
      return m;
    });
  }, [currentNode, currentNodeId, committedAnswers, tempAnswers]);

  const previous = useCallback(() => {
    if (history.length <= 1) return;

    const newHistory = [...history];
    newHistory.pop();
    const prevNodeId = newHistory[newHistory.length - 1];

    setHistory(newHistory);
    setCurrentNodeId(prevNodeId);
    
    // Clear temp selections when navigating back
    setTempAnswers(prev => {
      const m = new Map(prev);
      m.delete(currentNodeId);
      return m;
    });
    setTempRefinements(prev => {
      const m = new Map(prev);
      m.delete(currentNodeId);
      return m;
    });
    setTempIntensities(prev => {
      const m = new Map(prev);
      m.delete(currentNodeId);
      return m;
    });
    
    // Clear focused sliders when going back
    setFocusedSliders(new Set());
    
    // Clear intensity slider enabled state when going back
    setEnabledSliders(prev => {
      const m = new Map(prev);
      m.delete('intensity');
      return m;
    });
  }, [history, currentNodeId]);

  const jumpTo = useCallback((nodeId: string) => {
    if (!nodeMap.has(nodeId)) return;

    // Clear temp selections when jumping to a different node
    setTempAnswers(prev => {
      const m = new Map(prev);
      m.delete(currentNodeId);
      return m;
    });
    setTempRefinements(prev => {
      const m = new Map(prev);
      m.delete(currentNodeId);
      return m;
    });
    setTempIntensities(prev => {
      const m = new Map(prev);
      m.delete(currentNodeId);
      return m;
    });
    
    // Clear focused sliders when jumping to a different node
    setFocusedSliders(new Set());
    
    // Clear intensity slider enabled state when jumping to a different node
    setEnabledSliders(prev => {
      const m = new Map(prev);
      m.delete('intensity');
      return m;
    });

    setCurrentNodeId(nodeId);

    if (!history.includes(nodeId)) {
      setHistory(prev => [...prev, nodeId]);
    }
  }, [history, nodeMap, currentNodeId]);

  // Category jump - navigates without affecting history or clearing temp selections
  const jumpToCategory = useCallback((nodeId: string) => {
    if (!nodeMap.has(nodeId)) return;
    
    // Simply change the current node - don't modify history or temp selections
    // This allows free navigation without breaking the interview flow
    setCurrentNodeId(nodeId);
    
    // Optionally add to history if not already there (for back navigation)
    if (!history.includes(nodeId)) {
      setHistory(prev => [...prev, nodeId]);
    }
  }, [nodeMap, history]);

  // Check if a category has committed selections
  const categoryHasCommittedSelections = useCallback((categoryNodes: string[]): boolean => {
    for (const nodeId of categoryNodes) {
      // Check if there are committed answers for this node
      if (committedAnswers.some(a => a.nodeId === nodeId)) {
        return true;
      }
      // Check if there are committed refinements for this node
      if (committedRefinements.some(r => r.refinementId === nodeId)) {
        return true;
      }
      // Check if there are committed weights associated with this node
      const hasWeights = Array.from(weightValues.values()).some(w => {
        const associatedAnswer = committedAnswers.find(a => a.id === w.associatedAnswerId);
        const associatedRefinement = committedRefinements.find(r => r.id === w.associatedAnswerId);
        return (associatedAnswer && associatedAnswer.nodeId === nodeId) ||
               (associatedRefinement && associatedRefinement.refinementId === nodeId);
      });
      if (hasWeights) {
        return true;
      }
    }
    return false;
  }, [committedAnswers, committedRefinements, weightValues]);

  const setIntensity = useCallback((nodeId: string, value: number) => {
    setTempIntensities(prev => {
      const m = new Map(prev);
      m.set(nodeId, value);
      return m;
    });
  }, []);

  const setCustomExtension = useCallback((nodeId: string, extension: string) => {
    // Store the raw value (with spaces) for the input field
    // Always set the value, even if empty string, to allow deletion
    setTempCustomExtensions(prev => {
      const m = new Map(prev);
      m.set(nodeId, extension);
      return m;
    });
    // Also update the temp answer/refinement if it exists (store raw value for now)
    setTempAnswers(prevAnswers => {
      const m = new Map(prevAnswers);
      const existing = m.get(nodeId);
      if (existing) {
        m.set(nodeId, {
          ...existing,
          customExtension: extension || undefined,
        });
      }
      return m;
    });
    setTempRefinements(prevRefinements => {
      const m = new Map(prevRefinements);
      const existing = m.get(nodeId);
      if (existing) {
        m.set(nodeId, {
          ...existing,
          customExtension: extension || undefined,
        });
      }
      return m;
    });
  }, []);

  const setSliderEnabled = useCallback((attrId: string, enabled: boolean) => {
    setEnabledSliders(prev => {
      const m = new Map(prev);
      m.set(attrId, enabled);
      return m;
    });
  }, []);

  const setSliderFocused = useCallback((attrId: string, focused: boolean) => {
    setFocusedSliders(prev => {
      const newSet = new Set(prev);
      if (focused) {
        newSet.add(attrId);
      } else {
        newSet.delete(attrId);
      }
      return newSet;
    });
  }, []);

  const setWeight = useCallback((attrId: string, value: number, template: string, tags?: string[]) => {
    const weights = new Map(weightValues);
    // Find existing uncommitted weight for this attrId
    const existingWeight = Array.from(weights.entries()).find(([key, w]) => 
      w.attrId === attrId && !w.associatedAnswerId
    );
    
    if (existingWeight) {
      // Update existing temporary weight
      weights.set(existingWeight[0], { 
        ...existingWeight[1], 
        value, 
        template, 
        tags 
      });
    } else {
      // Create new temporary weight (will be committed with answer)
      // Use attrId as key for easy lookup
      weights.set(attrId, { 
        id: `temp-${attrId}`,
        attrId, 
        value, 
        template, 
        tags 
      });
    }
    setWeightValues(weights);
    
    // Mark this weight as touched
    setTouchedWeights(prev => new Set(prev).add(attrId));
  }, [weightValues]);

  const addCustomElement = useCallback((element: string) => {
    setCustomElements(prev => [...prev, { text: element, enabled: false, type: 'prompt' }]);
  }, []);

  const setCustomElementType = useCallback((index: number, type: 'prompt' | 'negative') => {
    setCustomElements(prev => prev.map((item, i) => 
      i === index ? { ...item, type } : item
    ));
  }, []);

  const removeCustomElement = useCallback((index: number) => {
    setCustomElements(prev => prev.filter((_, i) => i !== index));
  }, []);

  const toggleCustomElement = useCallback((index: number) => {
    setCustomElements(prev => prev.map((item, i) => 
      i === index ? { ...item, enabled: !item.enabled } : item
    ));
  }, []);

  const reset = useCallback(() => {
    setCurrentNodeId('root');
    setHistory(['root']);
    setCommittedAnswers([]);
    setCommittedRefinements([]);
    setTempAnswers(new Map());
    setTempRefinements(new Map());
    setTempIntensities(new Map());
    setWeightValues(new Map());
    setTouchedWeights(new Set());
    setEnabledSliders(new Map());
    setCustomElements([]);
  }, []);

  const getPreviewPrompt = useCallback((): { prompt: string; negativePrompt: string } => {
    // Use all committed answers and refinements (no ordering by history needed)
    // Only include weights that are associated with committed answers
    const committedAnswerIds = new Set(committedAnswers.map(a => a.id));
    const weightsArr = Array.from(weightValues.values()).filter(w => 
      !w.associatedAnswerId || committedAnswerIds.has(w.associatedAnswerId)
    );

    return assemblePrompt(committedAnswers, committedRefinements, weightsArr, customElements);
  }, [committedAnswers, committedRefinements, weightValues, customElements]);

  const isFinished = useCallback((): boolean => {
    if (!currentNode) return true;
    
    // If we're on a refinement node, check if a refinement has been selected
    const isRefinementNode = currentNodeId.startsWith('refine-');
    if (isRefinementNode) {
      // Check if a refinement answer has been selected (committed or temp)
      const hasSelectedRefinement = committedRefinements.some(r => r.refinementId === currentNodeId) || tempRefinements.has(currentNodeId);
      // If no refinement selected, we're not finished
      if (!hasSelectedRefinement) return false;
        // If refinement selected but no next node, we're finished
        return currentNode.answers ? currentNode.answers.every((a) => !a.next) : false;
      }
      
      // For regular nodes, check if all answers have no next and no refinements
      // If no answers, consider finished (weight-only nodes)
      if (!currentNode.answers || currentNode.answers.length === 0) {
        return true;
      }
      return currentNode.answers.every((a) => !a.next && (!currentNode.refinements || currentNode.refinements.length === 0));
  }, [currentNode, currentNodeId, committedRefinements, tempRefinements]);

  const getCurrentRefinement = useCallback((): RefinementNode | undefined => {
    // Check if current node is a refinement node (nodes that start with "refine-")
    const currentNodeAsRefinement = nodeMap.get(currentNodeId);
    if (currentNodeAsRefinement && currentNodeId.startsWith('refine-')) {
      // It's a refinement node referenced directly
      const hasNextPointers = currentNodeAsRefinement.answers && currentNodeAsRefinement.answers.some((a: any) => a.next);
      if (!hasNextPointers) {
        return currentNodeAsRefinement as RefinementNode;
      }
    }
    
    // Otherwise check refinements on current node
    if (!currentNode || !currentNode.refinements) return undefined;
    
    // Find refinement that hasn't been answered yet (check both committed and temp)
    for (const refinement of currentNode.refinements) {
      const hasCommitted = committedRefinements.some(r => r.refinementId === refinement.id);
      const hasTemp = tempRefinements.has(refinement.id);
      if (!hasCommitted && !hasTemp) {
        return refinement;
      }
    }
    
    return undefined;
  }, [currentNode, currentNodeId, committedRefinements, tempRefinements]);

  const getActiveWeights = useCallback((): Array<{ id: string; label: string; template: string; min: number; max: number; step: number; default: number; value: number }> => {
    const weights: Array<{ id: string; label: string; template: string; min: number; max: number; step: number; default: number; value: number }> = [];
    
    if (currentNode?.weights) {
      currentNode.weights.forEach((weight) => {
        const currentValue = weightValues.get(weight.id);
        weights.push({
          ...weight,
          value: currentValue?.value ?? weight.default,
        });
      });
    }
    
    const currentRefinement = getCurrentRefinement();
    if (currentRefinement?.weights) {
      currentRefinement.weights.forEach((weight) => {
        const currentValue = weightValues.get(weight.id);
        weights.push({
          ...weight,
          value: currentValue?.value ?? weight.default,
        });
      });
    }
    
    return weights;
  }, [currentNode, weightValues, getCurrentRefinement]);

  const stepCount = useMemo(() => {
    // Calculate total steps (simplified - count nodes in path)
    return history.length;
  }, [history]);

  const getSelectionSummary = useCallback(() => {
    // Return all committed answers with their node info
    return committedAnswers.map(ans => {
      const node = nodeMap.get(ans.nodeId);
      if (!node) return null;

      return {
        id: ans.id,
        nodeId: ans.nodeId,
        question: node.question,
        answerLabel: ans.label
      };
    }).filter(Boolean) as Array<{ id: string; nodeId: string; question: string; answerLabel: string }>;
  }, [committedAnswers, nodeMap]);

  const removeSelection = useCallback((selectionId: string) => {
    // Remove from committed answers
    setCommittedAnswers(prev => prev.filter(a => a.id !== selectionId));
    // Remove from committed refinements
    setCommittedRefinements(prev => prev.filter(r => r.id !== selectionId));
    // Remove associated weights
    setWeightValues(prev => {
      const m = new Map(prev);
      Array.from(m.entries()).forEach(([key, weight]) => {
        if (weight.associatedAnswerId === selectionId) {
          m.delete(key);
        }
      });
      return m;
    });
  }, []);

  const hasTempSelectionForCurrentNode = !!tempAnswers.get(currentNodeId) || !!tempRefinements.get(currentNodeId);
  const hasCommittedSelectionForCurrentNode = committedAnswers.some(a => a.nodeId === currentNodeId) || committedRefinements.some(r => r.refinementId === currentNodeId);

  return {
    currentNode,
    currentNodeId,
    history,
    committedAnswers,
    committedRefinements,
    weightValues,
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
    previous,
    jumpTo,
    jumpToCategory,
    categoryHasCommittedSelections,
    setWeight,
    setWeightValues,
    setSliderEnabled,
    enabledSliders,
    focusedSliders,
    setSliderFocused,
    customElements,
    addCustomElement,
    removeCustomElement,
    toggleCustomElement,
    setCustomElementType,
    reset,
    getPreviewPrompt,
    isFinished,
    getCurrentRefinement,
    getActiveWeights,
    stepCount,
    nodeMap,
    getSelectionSummary,
  };
}

