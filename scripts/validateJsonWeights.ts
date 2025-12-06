// Validates all weights in all JSON files for SD compatibility.
// Run with: npx tsx scripts/validateJsonWeights.ts

import * as fs from 'fs';
import * as path from 'path';
import { sanitizeTemplate } from '../src/services/templateSanitizer';

const FORBIDDEN_TEMPLATES = [
  "", " ", "height", "very tall", "slim", "moderate", "subtle",
  "pronounced", "focused", "strong", "cursed"
];

interface ValidationIssue {
  file: string;
  nodeId?: string;
  weightId?: string;
  issue: string;
  recommendation?: string;
}

const issues: ValidationIssue[] = [];

function validateWeight(weight: any, file: string, nodeId?: string): void {
  // Check for missing template
  if (!weight.template || weight.template.trim() === '') {
    issues.push({
      file,
      nodeId,
      weightId: weight.id,
      issue: 'Empty or missing template',
      recommendation: 'Add a descriptive template string'
    });
    return;
  }

  // Check for forbidden templates
  const template = weight.template.toLowerCase().trim();
  if (FORBIDDEN_TEMPLATES.includes(template)) {
    issues.push({
      file,
      nodeId,
      weightId: weight.id,
      issue: `Forbidden template: "${template}"`,
      recommendation: 'Use a more specific, SD-safe template'
    });
  }

  // Check for missing tags
  if (!weight.tags || weight.tags.length === 0) {
    issues.push({
      file,
      nodeId,
      weightId: weight.id,
      issue: 'Missing tags array',
      recommendation: 'Add tags array (e.g., ["hair"], ["camera", "perspective"])'
    });
  }

  // Test sanitization
  try {
    const sanitized = sanitizeTemplate({
      template: weight.template,
      tags: weight.tags || []
    });
    
    if (sanitized === template && FORBIDDEN_TEMPLATES.includes(template)) {
      issues.push({
        file,
        nodeId,
        weightId: weight.id,
        issue: `Template "${template}" would not be sanitized properly`,
        recommendation: `Suggested rewrite: "${sanitized}"`
      });
    }
  } catch (error) {
    issues.push({
      file,
      nodeId,
      weightId: weight.id,
      issue: `Sanitization error: ${error}`,
      recommendation: 'Check template format'
    });
  }
}

function validateNode(node: any, file: string): void {
  if (node.weights && Array.isArray(node.weights)) {
    node.weights.forEach((weight: any) => {
      validateWeight(weight, file, node.id);
    });
  }

  if (node.refinements && Array.isArray(node.refinements)) {
    node.refinements.forEach((refinement: any) => {
      if (refinement.weights && Array.isArray(refinement.weights)) {
        refinement.weights.forEach((weight: any) => {
          validateWeight(weight, file, refinement.id);
        });
      }
    });
  }
}

function scanDirectory(dir: string): void {
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      scanDirectory(filePath);
    } else if (file.endsWith('.json')) {
      try {
        const content = fs.readFileSync(filePath, 'utf-8');
        const data = JSON.parse(content);
        const relativePath = path.relative(process.cwd(), filePath);

        // Handle both array and single object formats
        const nodes = Array.isArray(data) ? data : [data];
        nodes.forEach((node: any) => {
          validateNode(node, relativePath);
        });
      } catch (error) {
        issues.push({
          file: path.relative(process.cwd(), filePath),
          issue: `JSON parse error: ${error}`,
          recommendation: 'Fix JSON syntax'
        });
      }
    }
  }
}

// Main execution
const interviewDir = path.join(process.cwd(), 'src', 'data', 'interview');

if (!fs.existsSync(interviewDir)) {
  console.error('Interview directory not found:', interviewDir);
  process.exit(1);
}

console.log('🔍 Scanning JSON files for weight template validation...\n');
scanDirectory(interviewDir);

// Report results
if (issues.length === 0) {
  console.log('✅ All weight templates are valid!');
  process.exit(0);
} else {
  console.log(`⚠️  Found ${issues.length} issue(s):\n`);
  
  issues.forEach((issue, index) => {
    console.log(`${index + 1}. ${issue.file}`);
    if (issue.nodeId) console.log(`   Node: ${issue.nodeId}`);
    if (issue.weightId) console.log(`   Weight: ${issue.weightId}`);
    console.log(`   Issue: ${issue.issue}`);
    if (issue.recommendation) {
      console.log(`   💡 Recommendation: ${issue.recommendation}`);
    }
    console.log('');
  });

  console.log('❌ Validation failed. Please fix the issues above.');
  process.exit(1);
}





