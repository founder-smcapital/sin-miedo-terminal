const fs = require("fs");
const path = require("path");
const Ajv2020 = require("ajv/dist/2020");

const ajv = new Ajv2020({ allErrors: true, strict: false, allowUnionTypes: true });

function walkJsonFiles(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...walkJsonFiles(fullPath));
    } else if (entry.isFile() && fullPath.endsWith(".json")) {
      files.push(fullPath);
    }
  }

  return files;
}

function main() {
  const repoRoot = path.resolve(__dirname, "..");
  const schemaDir = path.join(repoRoot, "schemas");
  const fixtureDir = path.join(repoRoot, "test", "fixtures");

  if (!fs.existsSync(schemaDir)) {
    throw new Error(`Schemas directory not found: ${schemaDir}`);
  }

  if (!fs.existsSync(fixtureDir)) {
    throw new Error(`Test fixtures directory not found: ${fixtureDir}`);
  }

  const schemaFiles = walkJsonFiles(schemaDir).filter((file) => file.endsWith(".schema.json"));
  const fixtureFiles = walkJsonFiles(fixtureDir);

  if (!schemaFiles.length) {
    throw new Error("No schema files were found under schemas/.");
  }

  if (!fixtureFiles.length) {
    throw new Error("No fixture files were found under test/fixtures/.");
  }

  let validatedCount = 0;

  for (const schemaFile of schemaFiles) {
    const schema = JSON.parse(fs.readFileSync(schemaFile, "utf8"));
    const schemaName = path.basename(schemaFile, ".schema.json");
    const matchingFixtures = fixtureFiles.filter((file) => {
      const base = path.basename(file, ".json");
      return base === schemaName || base.startsWith(`${schemaName}.`) || base.startsWith(`${schemaName}-`);
    });

    if (!matchingFixtures.length) {
      console.warn(`No fixtures matched schema: ${schemaName}`);
      continue;
    }

    const validate = ajv.compile(schema);

    for (const fixtureFile of matchingFixtures) {
      const payload = JSON.parse(fs.readFileSync(fixtureFile, "utf8"));
      const valid = validate(payload);
      if (!valid) {
        throw new Error(
          `${path.relative(repoRoot, fixtureFile)} failed schema ${path.relative(repoRoot, schemaFile)}: ${ajv.errorsText(validate.errors)}`
        );
      }
      validatedCount += 1;
    }
  }

  console.log(`Validated ${validatedCount} fixtures against ${schemaFiles.length} schemas.`);
}

try {
  main();
} catch (error) {
  console.error("Contract test failed:");
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
}
