import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { runInNewContext } from "node:vm";
import test from "node:test";
import { fileURLToPath } from "node:url";
import ts from "typescript";

const sourcePath = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
  "src",
  "lib",
  "stored-user.ts",
);
const source = readFileSync(sourcePath, "utf8");
const { outputText } = ts.transpileModule(source, {
  compilerOptions: {
    module: ts.ModuleKind.CommonJS,
    target: ts.ScriptTarget.ES2020,
  },
});
const compiledModule = { exports: {} };
runInNewContext(outputText, { exports: compiledModule.exports });

test("parses a valid stored user", () => {
  assert.deepEqual(
    JSON.parse(JSON.stringify(compiledModule.exports.parseStoredUser(
      '{"nombre":"Ana","email":"ana@example.com","rol":"Admin"}',
    ))),
    { nombre: "Ana", email: "ana@example.com", rol: "Admin" },
  );
});

test("ignores malformed or non-object stored user data", () => {
  assert.equal(compiledModule.exports.parseStoredUser("{"), null);
  assert.equal(compiledModule.exports.parseStoredUser('"Ana"'), null);
  assert.equal(compiledModule.exports.parseStoredUser(null), null);
});
