//TODO finish, this is just a test

import fs from "fs";
import path from "path";

const envFiles = [
  { example: ".env.example", target: ".env" },
  { example: ".env.test.example", target: ".env.test" },
];

console.log("🔧 Setting up environment files...\n");

envFiles.forEach(({ example, target }) => {
  const examplePath = path.join(__dirname, "..", example);
  const targetPath = path.join(__dirname, "..", target);

  if (!fs.existsSync(targetPath)) {
    if (fs.existsSync(examplePath)) {
      fs.copyFileSync(examplePath, targetPath);
      console.log(`✅ Created ${target} from ${example}`);
    } else {
      console.log(`⚠️  ${example} not found, skipping ${target}`);
    }
  } else {
    console.log(`ℹ️  ${target} already exists, skipping`);
  }
});

console.log("\n🎉 Environment setup complete!");
console.log("\n📝 Next steps:");
console.log("1. Review and update the .env files with your actual values");
console.log('2. Run "pnpm docker:dev" to start the development environment');
console.log('3. Run "pnpm dev" to start the development servers\n');
