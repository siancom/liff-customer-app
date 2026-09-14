const fs = require('fs');
const readline = require('readline');

const logPath = '/Users/ittichai/.gemini/antigravity-ide/brain/cc6538ea-977f-4608-856f-2b1e2bb15cd4/.system_generated/logs/transcript.jsonl';

async function extract() {
  const fileStream = fs.createReadStream(logPath);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  let foundDiffCommand = false;
  for await (const line of rl) {
    if (line.includes('"git diff src/App.jsx"')) {
        foundDiffCommand = true;
    } else if (foundDiffCommand && line.includes('"type":"TOOL_RESPONSE"')) {
        const parsed = JSON.parse(line);
        if (parsed.content) {
            fs.writeFileSync('full_diff.txt', parsed.content);
            console.log("Extracted diff to full_diff.txt");
            foundDiffCommand = false;
        }
    }
  }
}
extract();
