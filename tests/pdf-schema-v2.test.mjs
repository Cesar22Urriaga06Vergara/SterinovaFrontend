import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import path from 'node:path';
import {createRequire} from 'node:module';
import {runInNewContext} from 'node:vm';
import test from 'node:test';
import ts from 'typescript';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
const require=createRequire(import.meta.url),root=path.resolve('src');
function load(file){
  const compiled={exports:{}};
  const code=ts.transpileModule(readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX,target:ts.ScriptTarget.ES2020}}).outputText;
  runInNewContext(code,{exports:compiled.exports,Intl,URL,process:{env:{}},require:(id)=>{
    if(id==='next/image')return {default:(props)=>{const clean={...props};delete clean.unoptimized;return React.createElement('img',clean);}};
    if(id.startsWith('@/'))return load(path.join(root,id.slice(2))+'.ts');
    if(id.startsWith('.'))return load(path.resolve(path.dirname(file),id)+'.ts');
    return require(id);
  }});
  return compiled.exports;
}
const person={nombre:'Ana',apellido:'Prueba',cargo:'Profesional de Calidad'};
const keys={ETO:['temperatura','humedad','presion','tiempo_exposicion','tiempo_aireacion'],VAPOR:['temperatura','tiempo_exposicion','tiempo_secado','humedad_presion','tiempo_aireacion']};
const materialColumns=['descripcion','referencia','lote','cantidad','empaque','muestras_retencion','muestras_cliente','muestras_laboratorio'];
function certificateWithMaterials(materiales){
  const {CertificadoPDF}=load(path.join(root,'components/pdf/CertificadoPDF.tsx'));
  return renderToStaticMarkup(React.createElement(CertificadoPDF,{data:{consecutivo:'MULTI-001',snapshot_datos:{materiales}}}));
}
function materialRows(html){
  const table=html.match(/<table\b[^>]*><thead>[\s\S]*?DESCRIPCIÓN[\s\S]*?<\/table>/)?.[0];
  assert.ok(table,'material table exists');
  return [...table.matchAll(/<tbody>([\s\S]*?)<\/tbody>/g)][0][1].match(/<tr\b[^>]*>[\s\S]*?<\/tr>/g)??[];
}
for(const count of [1,5,25]){
  test(`certificate renders exactly ${count} material rows with independent frozen values`,()=>{
    const materiales=Array.from({length:count},(_,i)=>({id:i+1,descripcion:`Producto ${i+1}`,referencia:`REF-${i+1}`,lote:`LOTE-${i+1}`,cantidad:i+10,empaque:`EMPAQUE-${i+1}`,muestras_retencion:i,muestras_cliente:i+2,muestras_laboratorio:null}));
    const rows=materialRows(certificateWithMaterials(materiales));
    assert.equal(rows.length,count);
    materiales.forEach((material,i)=>{
      const cells=[...rows[i].matchAll(/<td\b[^>]*>(.*?)<\/td>/g)].map(match=>match[1]);
      assert.deepEqual(cells,materialColumns.map(key=>material[key]===null?'N/A':String(material[key])));
    });
  });
}
for(const materiales of [[],null,undefined]){
  test(`certificate renders one N/A row for ${JSON.stringify(materiales)} materials`,()=>{
    const rows=materialRows(certificateWithMaterials(materiales));
    assert.equal(rows.length,1);
    assert.equal((rows[0].match(/>N\/A<\/td>/g)??[]).length,8);
  });
}
test('certificate prints frozen materials, dates and people without ICONTEC/QR/version or content in stamp box',()=>{
  const {CertificadoPDF}=load(path.join(root,'components/pdf/CertificadoPDF.tsx'));
  const snapshot={schema_version:2,documento:{fecha_emision:'2026-11-09',fecha_esterilizacion:'2024-02-29',fecha_vencimiento:'2027-02-28'},
    cliente:{razon_social:'Cliente congelado'},elaborado_por:person,aprobador:person,
    materiales:[{descripcion:'Bata',lote:'LOTE-REAL',empaque:'BOLSA-REAL',cantidad:39,muestras_retencion:0}],
    informacion_tecnica:{metodo:'ETO',tablas:{ETO:keys.ETO.map(parametro=>({parametro,especificacion:'Rango',resultado:55,criterio:'CUMPLE'})),VAPOR:keys.VAPOR.map(parametro=>({parametro,especificacion:'N/A',resultado:'N/A',criterio:'N/A'}))}},
    ciclo_esterilizacion:{metodo:'ETO',equipo:'E03'},certificado:{ciclo:'123'}};
  const html=renderToStaticMarkup(React.createElement(CertificadoPDF,{data:{consecutivo:'001',snapshot_datos:snapshot,cicloEsterilizacion:{orden:{}}}}));
  assert.match(html,/data-pdf-schema-version="2"/);
  assert.match(html,/LOTE-REAL/);assert.match(html,/BOLSA-REAL/);assert.match(html,/28\/02\/2027/);
  assert.match(html,/Ana Prueba/);assert.match(html,/Profesional de Calidad/);
  assert.doesNotMatch(html,/icontec|QRCode|SELLO|VERSION:|>APROBADO<|N\. FUENTES|J\. BARRERO/i);
  assert.match(html,/<div[^>]*data-stamp-box[^>]*><\/div>/);
  assert.equal((html.match(/data-technical-row=/g)||[]).length,10);
});
test('quotation uses its frozen seal and the same persisted IVA label in totals and note',()=>{
  const {CotizacionPDF}=load(path.join(root,'components/pdf/CotizacionPDF.tsx'));
  const html=renderToStaticMarkup(React.createElement(CotizacionPDF,{data:{tipo_servicio:'INDUSTRIAL_ETO',fecha:'2026-11-09',consecutivo:'COT-IND-001',iva_tasa:'0.05',subtotal:100,iva:5,total:105,items:[],sellos:{icontec:{imagen_src:'/internal/pdf-assets/sellos/frozen.jpg'}}}}));
  assert.match(html,/data-pdf-schema-version="2"/);assert.match(html,/src="\/internal\/pdf-assets\/sellos\/frozen.jpg"/);
  assert.match(html,/Precios antes de IVA \(5%\)/);assert.doesNotMatch(html,/19%|certificaciones-icontec-iqnet.jpeg/);
});
