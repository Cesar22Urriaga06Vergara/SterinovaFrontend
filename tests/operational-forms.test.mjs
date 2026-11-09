import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';
import test from 'node:test';
import ts from 'typescript';
const source=readFileSync(new URL('../src/lib/operational-forms.ts',import.meta.url),'utf8');
const compiled={exports:{}};
runInNewContext(ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText,{exports:compiled.exports});
const {nuevoMaterial,validarMateriales,evaluacionesParaAprobar}=compiled.exports;
test('materiales preserve zero/N/A and reject fractions',()=>{
  const material={...nuevoMaterial(),descripcion:'Bata',muestras_retencion:0};
  assert.equal(validarMateriales([material]),'');
  assert.equal(material.muestras_cliente,null);
  assert.notEqual(validarMateriales([{...material,cantidad:1.5}]),'');
  assert.notEqual(validarMateriales([{...material,muestras_cliente:-1}]),'');
});
test('approval requires an explicit passing evaluation and protocol alternative',()=>{
  const protocol={especificaciones_json:{filas:[{parametro:'temperatura',aplicable:true,opciones:['50-60']},{parametro:'aireacion',aplicable:false,opciones:['N/A']}]}};
  assert.equal(evaluacionesParaAprobar(protocol,{}),null);
  assert.equal(evaluacionesParaAprobar(protocol,{temperatura:{criterio:'NO_CUMPLE',opcion:'0'}}),null);
  assert.equal(evaluacionesParaAprobar(protocol,{temperatura:{criterio:'CUMPLE',opcion:''}}),null);
  assert.equal(evaluacionesParaAprobar(protocol,{temperatura:{criterio:'CUMPLE',opcion:'0'}})[0].opcion,0);
});
