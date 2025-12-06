import React, { useState } from "react";
import { CATEGORY_MAP, CategoryItem } from "../../data/categoryMap";
import "./CategorySidebar.css";

interface CategorySidebarProps {
  onSelectCategory: (nodeId: string) => void;
  hasCommitted: (categoryNodes: string[]) => boolean;
  currentNodeId?: string;
  nodeMap?: Map<string, any>;
}

export function CategorySidebar({
  onSelectCategory,
  hasCommitted,
  currentNodeId,
  nodeMap
}: CategorySidebarProps) {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [expandedSubcategories, setExpandedSubcategories] = useState<Set<string>>(new Set());

  // Helper to get display name for category
  const getCategoryDisplayName = (categoryId: string): string => {
    const names: Record<string, string> = {
      character: "Character",
      physical: "Physical",
      hair: "Hair",
      face: "Face",
      environment: "Environment",
      style: "Style",
      camera: "Camera",
      effects: "Effects"
    };
    return names[categoryId] || categoryId.toUpperCase();
  };

  // Helper to capitalize words properly (title case)
  const toTitleCase = (str: string): string => {
    return str
      .toLowerCase()
      .split(/\s+/)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  // Helper to get display name for a node
  const getNodeDisplayName = (nodeId: string): string => {
    if (!nodeMap) return nodeId;
    const node = nodeMap.get(nodeId);
    if (node && node.question) {
      const question = node.question.trim();
      
      // Pattern: "What framing?" → "Framing"
      let match = question.match(/^What\s+([^?]+)\?$/i);
      if (match) {
        return toTitleCase(match[1].trim());
      }
      
      // Pattern: "Which visual perspective best describes..." → "Visual Perspective"
      match = question.match(/^Which\s+(.+?)\s+(?:best\s+describes|would\s+you|do\s+you)/i);
      if (match) {
        return toTitleCase(match[1].trim());
      }
      
      // Pattern: "Which X..." → "X"
      match = question.match(/^Which\s+(.+?)\??$/i);
      if (match) {
        return toTitleCase(match[1].trim());
      }
      
      // Pattern: "What aspect of the X would you like to define?" → "X Aspects"
      match = question.match(/^What\s+aspect\s+of\s+(?:the\s+)?(.+?)\s+would\s+you\s+like\s+to\s+(?:define|edit|configure)\??$/i);
      if (match) {
        const subject = match[1].trim();
        return toTitleCase(subject) + " Aspects";
      }
      
      // Pattern: "What is the X?" → "X"
      match = question.match(/^What\s+is\s+(?:the\s+)?(.+?)\??$/i);
      if (match) {
        return toTitleCase(match[1].trim());
      }
      
      // Pattern: "What are the X like?" → "X"
      match = question.match(/^What\s+are\s+(?:the\s+)?(.+?)\s+like\??$/i);
      if (match) {
        return toTitleCase(match[1].trim());
      }
      
      // Pattern: "What X would you like to Y?" → "X"
      match = question.match(/^What\s+(.+?)\s+would\s+you\s+like\s+to\s+.+\??$/i);
      if (match) {
        return toTitleCase(match[1].trim());
      }
      
      // Pattern: "How X?" → "X"
      match = question.match(/^How\s+(.+?)\??$/i);
      if (match) {
        return toTitleCase(match[1].trim());
      }
      
      // Fallback: Remove "What", "How", "Which", question marks, and clean up
      let name = question
        .replace(/^What\s+(is|are|is the|are the)\s+/i, '')
        .replace(/^How\s+/i, '')
        .replace(/^Which\s+/i, '')
        .replace(/\s+would\s+you\s+like\s+to\s+(define|edit|configure|select)\??$/i, '')
        .replace(/\s+best\s+describes\s+.+\??$/i, '')
        .replace(/\?$/, '')
        .replace(/^the\s+/i, '')
        .trim();
      
      return toTitleCase(name) || nodeId;
    }
    return nodeId;
  };

  // Collect all node IDs from a category item (including subcategories)
  const collectNodeIds = (items: CategoryItem[]): string[] => {
    const nodeIds: string[] = [];
    items.forEach(item => {
      if (item.nodeId) {
        nodeIds.push(item.nodeId);
      }
      if (item.subcategories) {
        nodeIds.push(...collectNodeIds(item.subcategories));
      }
    });
    return nodeIds;
  };

  // Toggle category expansion
  const toggleCategory = (categoryId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId);
      } else {
        newSet.add(categoryId);
      }
      return newSet;
    });
  };

  // Toggle subcategory expansion
  const toggleSubcategory = (subcategoryKey: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedSubcategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(subcategoryKey)) {
        newSet.delete(subcategoryKey);
      } else {
        newSet.add(subcategoryKey);
      }
      return newSet;
    });
  };

  // Check if current node belongs to a category
  const isCategoryActive = (items: CategoryItem[]): boolean => {
    if (!currentNodeId) return false;
    const nodeIds = collectNodeIds(items);
    return nodeIds.includes(currentNodeId);
  };

  // Check if a specific node is active
  const isNodeActive = (nodeId: string): boolean => {
    return currentNodeId === nodeId;
  };

  // Check if a category item or its subcategories have committed selections
  const itemHasCommitted = (item: CategoryItem): boolean => {
    const nodeIds: string[] = [];
    if (item.nodeId) {
      nodeIds.push(item.nodeId);
    }
    if (item.subcategories) {
      item.subcategories.forEach(sub => {
        if (sub.nodeId) {
          nodeIds.push(sub.nodeId);
        }
        // Recursively collect from nested subcategories
        if (sub.subcategories) {
          sub.subcategories.forEach(nested => {
            if (nested.nodeId) {
              nodeIds.push(nested.nodeId);
            }
          });
        }
      });
    }
    return nodeIds.length > 0 && hasCommitted(nodeIds);
  };

  return (
    <div className="category-sidebar">
      <div className="category-sidebar-logo">
        <div className="logo-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <div className="logo-text">
          <span className="logo-text-main">SD Prompt</span>
          <span className="logo-text-sub">Generator</span>
        </div>
      </div>
      <div className="category-sidebar-content">
        <div className="category-sidebar-header">
          <div className="category-sidebar-divider"></div>
        </div>
        <div className="category-sidebar-list">
          <div className="category-sidebar-title-wrapper">
            <h3 className="category-sidebar-title">Categories</h3>
          </div>
        {Object.entries(CATEGORY_MAP).map(([categoryId, items]) => {
          const allNodeIds = collectNodeIds(items);
          const visited = hasCommitted(allNodeIds);
          const active = isCategoryActive(items);
          const firstNode = items[0]?.nodeId || items[0]?.subcategories?.[0]?.nodeId;
          const isExpanded = expandedCategories.has(categoryId);

          return (
            <div key={categoryId} className="category-group">
              <div
                className={`category-item ${visited ? "visited" : ""} ${active ? "active" : ""}`}
                onClick={() => firstNode && onSelectCategory(firstNode)}
                title={`Jump to ${getCategoryDisplayName(categoryId)}`}
              >
                <div className="category-item-main">
                  <span className="category-item-label">
                    {getCategoryDisplayName(categoryId)}
                  </span>
                  {visited && <span className="dot-indicator" title="Has committed selections" />}
                </div>
                <button
                  className={`category-expand-button ${isExpanded ? "expanded" : ""}`}
                  onClick={(e) => toggleCategory(categoryId, e)}
                  title={isExpanded ? "Collapse" : "Expand"}
                >
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </div>
              {isExpanded && (
                <div className="category-dropdown">
                  {items.map((item, index) => {
                    const itemKey = `${categoryId}-${index}`;
                    const hasSubcategories = item.subcategories && item.subcategories.length > 0;
                    const isSubcategoryExpanded = expandedSubcategories.has(itemKey);
                    const itemNodeIds = item.nodeId ? [item.nodeId] : [];
                    if (item.subcategories) {
                      item.subcategories.forEach(sub => {
                        if (sub.nodeId) itemNodeIds.push(sub.nodeId);
                        // Recursively collect from nested subcategories
                        if (sub.subcategories) {
                          sub.subcategories.forEach(nested => {
                            if (nested.nodeId) itemNodeIds.push(nested.nodeId);
                          });
                        }
                      });
                    }
                    const itemVisited = itemNodeIds.length > 0 && hasCommitted(itemNodeIds);
                    const itemActive = item.nodeId ? isNodeActive(item.nodeId) : false;

                    return (
                      <div key={itemKey} className="category-subcategory-group">
                        <div
                          className={`category-dropdown-item ${itemActive ? "active" : ""} ${itemVisited ? "visited" : ""} ${hasSubcategories ? "has-subcategories" : ""}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            // If it has subcategories, navigate to the main node (if exists) or expand
                            if (hasSubcategories) {
                              // If there's a main nodeId, navigate to it; otherwise just expand
                              if (item.nodeId) {
                                onSelectCategory(item.nodeId);
                              } else {
                                toggleSubcategory(itemKey, e);
                              }
                            } else if (item.nodeId) {
                              onSelectCategory(item.nodeId);
                            }
                          }}
                          title={item.label}
                        >
                          <div className="category-dropdown-item-main">
                            <span className="category-dropdown-label">
                              {item.label}
                            </span>
                            {itemVisited && <span className="dot-indicator" title="Has committed selections" />}
                          </div>
                          {hasSubcategories && (
                            <button
                              className={`category-expand-button ${isSubcategoryExpanded ? "expanded" : ""}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleSubcategory(itemKey, e);
                              }}
                              title={isSubcategoryExpanded ? "Collapse" : "Expand"}
                            >
                              <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                                <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                            </button>
                          )}
                        </div>
                              {hasSubcategories && isSubcategoryExpanded && (
                                <div className="category-subcategory-dropdown">
                                  {item.subcategories!.map((subItem, subIndex) => {
                              const subItemKey = `${itemKey}-${subIndex}`;
                              const hasNestedSubcategories = subItem.subcategories && subItem.subcategories.length > 0;
                              const isNestedExpanded = expandedSubcategories.has(subItemKey);
                              const subActive = subItem.nodeId ? isNodeActive(subItem.nodeId) : false;
                              const subNodeIds: string[] = [];
                              if (subItem.nodeId) subNodeIds.push(subItem.nodeId);
                              if (subItem.subcategories) {
                                subItem.subcategories.forEach(nested => {
                                  if (nested.nodeId) subNodeIds.push(nested.nodeId);
                                });
                              }
                              const subVisited = subNodeIds.length > 0 && hasCommitted(subNodeIds);
                              
                              return (
                                <div key={subItemKey} className="category-subcategory-group">
                                  <div
                                    className={`category-subcategory-item ${subActive ? "active" : ""} ${subVisited ? "visited" : ""} ${hasNestedSubcategories ? "has-subcategories" : ""}`}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      if (hasNestedSubcategories) {
                                        if (subItem.nodeId) {
                                          onSelectCategory(subItem.nodeId);
                                        } else {
                                          toggleSubcategory(subItemKey, e);
                                        }
                                      } else if (subItem.nodeId) {
                                        onSelectCategory(subItem.nodeId);
                                      }
                                    }}
                                    title={subItem.label}
                                  >
                                    <span className="category-subcategory-label">
                                      {subItem.label}
                                    </span>
                                    {subVisited && <span className="dot-indicator" title="Has committed selections" />}
                                    {hasNestedSubcategories && (
                                      <button
                                        className={`category-expand-button ${isNestedExpanded ? "expanded" : ""}`}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          toggleSubcategory(subItemKey, e);
                                        }}
                                        title={isNestedExpanded ? "Collapse" : "Expand"}
                                      >
                                        <svg width="8" height="8" viewBox="0 0 12 12" fill="none">
                                          <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                        </svg>
                                      </button>
                                    )}
                                  </div>
                                  {hasNestedSubcategories && isNestedExpanded && (
                                    <div className="category-nested-subcategory-dropdown">
                                      {subItem.subcategories!.map((nestedItem) => {
                                        if (!nestedItem.nodeId) return null;
                                        const nestedActive = isNodeActive(nestedItem.nodeId);
                                        const nestedVisited = hasCommitted([nestedItem.nodeId]);
                                        
                                        return (
                                          <div
                                            key={nestedItem.nodeId}
                                            className={`category-nested-subcategory-item ${nestedActive ? "active" : ""} ${nestedVisited ? "visited" : ""}`}
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              onSelectCategory(nestedItem.nodeId!);
                                            }}
                                            title={nestedItem.label}
                                          >
                                            <span className="category-nested-subcategory-label">
                                              {nestedItem.label}
                                            </span>
                                            {nestedVisited && <span className="dot-indicator" title="Has committed selections" />}
                                          </div>
                                        );
                                      })}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
        </div>
      </div>
    </div>
  );
}

