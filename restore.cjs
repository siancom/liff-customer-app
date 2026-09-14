const fs = require('fs');
const readline = require('readline');
const path = require('path');

const logPath = '/Users/ittichai/.gemini/antigravity-ide/brain/fb5945a0-0606-40ad-bf3c-74f92c31bda4/.system_generated/logs/transcript.jsonl';

async function processLineByLine() {
  const fileStream = fs.createReadStream(logPath);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  for await (const line of rl) {
    try {
      const parsed = JSON.parse(line);
      if (parsed.tool_calls) {
         for (const tc of parsed.tool_calls) {
            if (tc.name === 'default_api:write_to_file' || tc.name === 'write_to_file') {
               const args = typeof tc.arguments === 'string' ? JSON.parse(tc.arguments) : tc.arguments;
               if (args.TargetFile && args.CodeContent) {
                  console.log("Restoring", args.TargetFile);
                  const target = args.TargetFile.replace('/Users/ittichai/ZCodeProject/liff-customer-app ', '/Users/ittichai/ZCodeProject/liff-customer-app/');
                  fs.mkdirSync(path.dirname(target), { recursive: true });
                  fs.writeFileSync(target, args.CodeContent);
               }
            }
            if (tc.name === 'default_api:replace_file_content' || tc.name === 'replace_file_content') {
               const args = typeof tc.arguments === 'string' ? JSON.parse(tc.arguments) : tc.arguments;
               if (args.TargetFile && args.TargetFile.includes('App.jsx') && args.ReplacementContent) {
                  // We could try to apply replacements, but might be tricky.
                  // It's safer to just get the final App.jsx if it was saved somewhere.
               }
            }
         }
      }
    } catch (e) { }
  }
}

processLineByLine();
