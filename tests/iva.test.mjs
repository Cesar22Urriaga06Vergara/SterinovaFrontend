import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import test from 'node:test';
import ts from 'typescript';

const source = readFileSync(new URL('../src/lib/iva.ts', import.meta.url), 'utf8');
const { outputText } = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS } });
const compiledModule = { exports: {} };
runInNewContext(outputText, { exports: compiledModule.exports, Intl });

test('preview uses the supplied fraction and rounds line, subtotal, tax and total like the server', () => {
  const amounts = compiledModule.exports.quoteAmounts([{ cantidad: 3, valor_unitario: 10.55 }], '0.050000');
  assert.equal(amounts.subtotal, 31.65);
  assert.equal(amounts.iva, 1.58);
  assert.equal(amounts.total, 33.23);
  assert.equal(compiledModule.exports.ivaLabel('0.05'), 'IVA (5%)');
  assert.equal(compiledModule.exports.ivaLabel('0'), 'IVA (0%)');
});
test('legacy label stays unchanged but an explicitly unknown rate is not invented', () => {
  assert.equal(compiledModule.exports.ivaLabel(undefined), 'IVA (19%)');
  assert.equal(compiledModule.exports.ivaLabel(null), 'IVA');
});
test('rounds tax at half a cent without floating-point drift', () => {
  assert.equal(compiledModule.exports.quoteAmounts([{ cantidad: 1, valor_unitario: 1 }], '0.145000').iva, 0.15);
});
