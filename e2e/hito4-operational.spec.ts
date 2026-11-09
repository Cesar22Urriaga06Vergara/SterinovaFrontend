import {test,expect,type Page} from '@playwright/test';
async function session(page:Page){
  await page.addInitScript(()=>localStorage.setItem('access_token','hito4-test-token'));
  await page.route('http://localhost:3001/auth/me',route=>route.fulfill({json:{user:{id:1,nombre:'Prueba',rol:'Admin'},permissions:[],capabilities:[],available_scopes:[],current_scope:null}}));
}
test('captures material lots, packaging, zero samples and N/A in a logistics order',async({page})=>{
  await session(page);
  await page.route('http://localhost:3001/logistica/ordenes',route=>route.request().method()==='GET'?route.fulfill({json:[]}):route.fulfill({status:201,json:{id:1}}));
  await page.route('http://localhost:3001/logistica/cotizaciones-aprobadas',route=>route.fulfill({json:[{id:1,consecutivo:'COT-IND-001',tipo_servicio:'INDUSTRIAL_ETO',total:105,cliente:{razon_social:'Cliente'}}]}));
  await page.goto('/logistica');
  await page.getByRole('button',{name:'Generar Orden de Recolección'}).click();
  await page.getByLabel('Cotización aprobada').selectOption('1');
  await page.getByLabel('Fecha programada').fill('2026-11-09');
  await page.getByLabel('Descripción material 1',{exact:true}).fill('Material quirúrgico');
  await page.getByLabel('Lote material 1',{exact:true}).fill('L-REAL');
  await page.getByLabel('Referencia material 1',{exact:true}).fill('REF-REAL');
  await page.getByLabel('Empaque material 1',{exact:true}).fill('BOLSA PGM');
  await page.getByLabel('Cantidad material 1',{exact:true}).fill('39');
  await page.getByLabel('Muestras de retención material 1',{exact:true}).fill('0');
  const request=page.waitForRequest(r=>r.url().endsWith('/logistica/ordenes')&&r.method()==='POST');
  await page.getByRole('button',{name:'Crear Orden',exact:true}).click();
  expect((await request).postDataJSON()).toMatchObject({metodo_esterilizacion:'ETO',materiales:[{descripcion:'Material quirúrgico',lote:'L-REAL',referencia:'REF-REAL',empaque:'BOLSA PGM',cantidad:39,muestras_retencion:0,muestras_cliente:null}]});
  await expect(page.getByRole('dialog')).toHaveCount(0);
});
test('registers vapor with an operational date and separate drying, without inventing air time',async({page})=>{
  await session(page);
  await page.route('http://localhost:3001/planta/protocolos',route=>route.fulfill({json:[{id:2,metodo:'VAPOR',version:1,especificaciones_json:{filas:[]}}]}));
  await page.route('http://localhost:3001/planta/ordenes',route=>route.fulfill({json:[{id:1,metodo_esterilizacion:'VAPOR',materiales:[{descripcion:'Material',cantidad:1}]}]}));
  await page.route('http://localhost:3001/planta/ciclos',route=>route.fulfill({status:201,json:{id:1}}));
  await page.goto('/planta/ciclo/nuevo?orden_id=1');
  await expect(page.getByLabel('Método',{exact:true})).toHaveValue('VAPOR');
  await page.getByLabel('Equipo',{exact:true}).fill('V01');
  await page.getByLabel('Fecha de esterilización',{exact:true}).fill('2024-02-29');
  await page.getByLabel('Temperatura',{exact:true}).fill('134');
  await page.getByLabel('Tiempo de Exposición',{exact:true}).fill('10');
  await page.getByLabel('Tiempo de Secado (min)',{exact:true}).fill('15');
  await page.getByLabel('Control Biológico',{exact:true}).fill('Negativo');
  await page.getByLabel('Control Químico',{exact:true}).fill('Cambio de color');
  const request=page.waitForRequest(r=>r.url().endsWith('/planta/ciclos')&&r.method()==='POST');
  await page.getByRole('button',{name:'Registrar Ciclo',exact:true}).click();
  expect((await request).postDataJSON()).toMatchObject({fecha_esterilizacion:'2024-02-29',protocolo_version_id:2,tiempo_secado:15,tiempo_aireacion:null,presion:null});
});
