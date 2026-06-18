const fs = require("fs");
const path = require("path");

const projectRoot = path.resolve(__dirname, "..");
const docsDir = path.join(projectRoot, "src", "content", "docs");
const outputFile = path.join(projectRoot, "public", "llms-full.txt");

let content = `# WeKraft Consolidated AI Documentation Hub
> This file contains the complete, consolidated product documentation, developer guides, and feature specs of WeKraft SaaS. Use this file to understand every feature, configuration, API interface, and integration guide.

---
`;

if (!fs.existsSync(docsDir)) {
  console.error(`Error: Docs directory not found at ${docsDir}`);
  process.exit(1);
}

const files = fs.readdirSync(docsDir).filter(file => file.endsWith(".md"));
console.log(`Found ${files.length} documentation files to compile.`);

// Sort files alphabetically to ensure deterministic order
files.sort();

for (const file of files) {
  const slug = path.basename(file, ".md");
  const filePath = path.join(docsDir, file);
  const fileContent = fs.readFileSync(filePath, "utf8");

  // Try to find the H1 title from the markdown file content
  const lines = fileContent.split(/\r?\n/);
  let title = slug
    .split("-")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  for (const line of lines) {
    if (line.startsWith("# ")) {
      title = line.substring(2).trim();
      break;
    }
  }

  content += `\n# Documentation Section: ${title}\n`;
  content += `Path: /web/docs/${slug}\n`;
  content += `URL: https://wekraft.xyz/web/docs/${slug}\n\n`;
  content += `${fileContent.trim()}\n\n`;
  content += `---\n`;
}

// Ensure the public directory exists
const publicDir = path.dirname(outputFile);
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

fs.writeFileSync(outputFile, content, "utf8");
console.log(`Successfully generated public/llms-full.txt with ${files.length} compiled sections!`);
