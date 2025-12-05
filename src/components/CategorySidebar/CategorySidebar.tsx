import React, { useState } from "react";
import { CATEGORY_MAP } from "../../data/categoryMap";
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

  // Check if current node belongs to a category
  const isCategoryActive = (categoryNodes: string[]): boolean => {
    if (!currentNodeId) return false;
    return categoryNodes.includes(currentNodeId);
  };

  // Check if a specific node is active
  const isNodeActive = (nodeId: string): boolean => {
    return currentNodeId === nodeId;
  };

  return (
    <div className="category-sidebar">
      <div className="category-sidebar-header">
        <h3 className="category-sidebar-title">Categories</h3>
      </div>
      <div className="category-sidebar-list">
        {Object.entries(CATEGORY_MAP).map(([categoryId, nodes]) => {
          const visited = hasCommitted(nodes);
          const active = isCategoryActive(nodes);
          const firstNode = nodes[0];
          const isExpanded = expandedCategories.has(categoryId);

          return (
            <div key={categoryId} className="category-group">
              <div
                className={`category-item ${visited ? "visited" : ""} ${active ? "active" : ""}`}
                onClick={() => onSelectCategory(firstNode)}
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
                  {nodes.map((nodeId) => {
                    const nodeActive = isNodeActive(nodeId);
                    return (
                      <div
                        key={nodeId}
                        className={`category-dropdown-item ${nodeActive ? "active" : ""}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectCategory(nodeId);
                        }}
                        title={getNodeDisplayName(nodeId)}
                      >
                        <span className="category-dropdown-label">
                          {getNodeDisplayName(nodeId)}
                        </span>
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
  );
}

