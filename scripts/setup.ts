import fs from "fs";
import path from "path";

const envMappings = [
  // Root level
  //   { example: ".env.example", target: ".env" },
  //   { example: ".env.test.example", target: ".env.test" },

  // API app
  { example: "apps/api/.env.dev.example", target: "apps/api/.env.dev" },
  { example: "apps/api/.env.prod.example", target: "apps/api/.env.prod" },
  { example: "apps/api/.env.test.example", target: "apps/api/.env.test" },

  // Dashboard app
  {
    example: "apps/dashboard/.env.example",
    target: "apps/dashboard/.env",
  },
];

console.log("🔧 Setting up environment files...\n");

let createdCount = 0;
let skippedCount = 0;

envMappings.forEach(({ example, target }) => {
  const examplePath = path.join(__dirname, "..", example);
  const targetPath = path.join(__dirname, "..", target);

  // Create directory if it doesn't exist
  const targetDir = path.dirname(targetPath);
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  if (!fs.existsSync(targetPath)) {
    if (fs.existsSync(examplePath)) {
      fs.copyFileSync(examplePath, targetPath);
      console.log(`✅ Created ${target}`);
      createdCount++;
    } else {
      console.log(`⚠️  ${example} not found, skipping ${target}`);
    }
  } else {
    console.log(`ℹ️  ${target} already exists, skipping`);
    skippedCount++;
  }
});

console.log(
  `\n📊 Summary: ${createdCount} files created, ${skippedCount} files skipped`
);
console.log("\n🎉 Environment setup complete!");
console.log("\n📝 Next steps:");
console.log("1. Review and update all .env files with your actual values");
console.log("2. Pay special attention to:");
console.log("   - Database credentials");
console.log("   - API keys (RESEND_API_KEY)");
console.log("   - Authentication secrets (BETTER_AUTH_SECRET)");
console.log('3. Run "pnpm docker:dev" to start the development environment');
console.log('4. Run "pnpm dev" to start all development servers\n');
