// Compatibility entry point: public game IDs now use random bazi codes.
const { run } = require("./migrateRandomPublicIds");
run({ gamesOnly: true, apply: process.argv.includes("--apply") }).catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
