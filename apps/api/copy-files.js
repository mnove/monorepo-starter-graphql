const fse = require("fs-extra");

// This script is needed since we need to copy all .graphql files from the src to the dist folder
// Since the typescript compiler otherwise ignores the .graphql files and they are not "compiled" into the dist folder
// const srcDir = "./src/graphql-api/schemas/**/*.graphql";
// const graphql_srcDir = "./src/api/graphql/typeDefs";
// const graphql_destDir = "./dist/api/graphql/typeDefs";

// // Prisma
const generated_srcDir = "./src/generated";
const generated_destDir = "./dist/generated";

// MJML Templates
const mjml_srcDir = "./src/templates/mjml";
const mjml_destDir = "./dist/templates/mjml";

// To copy a folder or file
try {
  // fse.copySync(graphql_srcDir, graphql_destDir, { overwrite: true });
  fse.copySync(generated_srcDir, generated_destDir, {
    overwrite: true,
  });
  fse.copySync(mjml_srcDir, mjml_destDir, {
    overwrite: true,
  });
  console.log(">> ---- Prisma Client, and MJML templates copied successfully");
} catch (error) {
  console.log("Error copying files: ", error);
}
