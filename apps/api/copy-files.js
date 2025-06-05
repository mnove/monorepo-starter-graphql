const fse = require("fs-extra");

const generated_srcDir = "./src/generated";
const generated_destDir = "./dist/generated";

try {
  fse.copySync(generated_srcDir, generated_destDir, {
    overwrite: true,
  });
  console.log(">> ---- Generated GraphQL types copied successfully");
} catch (error) {
  console.log("Error copying files: ", error);
}
