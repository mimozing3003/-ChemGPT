import { classifyIntent } from "../src/services/intent-router";

console.log("=== Testing Intent Router ===");

const testQueries = [
  "What is aspirin?",
  "Tell me about caffeine C8H10N4O2",
  "Balance H2 + O2 -> H2O",
  "Quiz me on organic chemistry",
  "Show me the 3D structure of benzene",
];

for (const q of testQueries) {
  const result = classifyIntent(q);
  console.log(`Query: "${q}" -> Intent: ${result.intent}, Compound: ${result.entities.compound || "none"}, Tools: ${result.toolsRequired.join(",")}`);
}
