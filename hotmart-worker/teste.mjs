// Teste local do Worker (node hotmart-worker/teste.mjs): simula a Hotmart e o Firestore, sem internet.
import worker from './worker.js';
import assert from 'node:assert/strict';

const {publicKey, privateKey} = await crypto.subtle.generateKey({name:'RSASSA-PKCS1-v1_5', modulusLength:2048, publicExponent:new Uint8Array([1,0,1]), hash:'SHA-256'}, true, ['sign','verify']);
const pk8 = Buffer.from(await crypto.subtle.exportKey('pkcs8', privateKey)).toString('base64');
const env = {HOTTOK:'segredo-teste-123', FIREBASE_PROJECT_ID:'tutor-estudos-f380b', FIREBASE_CLIENT_EMAIL:'worker@tutor.iam.gserviceaccount.com',
  FIREBASE_PRIVATE_KEY:'-----BEGIN PRIVATE KEY-----\\n' + pk8.match(/.{1,64}/g).join('\\n') + '\\n-----END PRIVATE KEY-----\\n'};

// Firestore falso
const db = {}; let tokens = 0;
const dec = v => Object.values(v)[0];
globalThis.fetch = async (u, op = {}) => {
  u = String(u);
  if (u.startsWith('https://oauth2.googleapis.com/token')) {
    const jwt = decodeURIComponent(op.body.split('assertion=')[1]); const [h, p, s] = jwt.split('.');
    const ok = await crypto.subtle.verify('RSASSA-PKCS1-v1_5', publicKey, Buffer.from(s, 'base64url'), new TextEncoder().encode(h + '.' + p));
    const claims = JSON.parse(Buffer.from(p, 'base64url'));
    assert.ok(ok, 'assinatura JWT'); assert.equal(claims.iss, env.FIREBASE_CLIENT_EMAIL); tokens++;
    return Response.json({access_token:'tok', expires_in:3600});
  }
  assert.equal(op.headers.authorization, 'Bearer tok');
  const base = `https://firestore.googleapis.com/v1/projects/${env.FIREBASE_PROJECT_ID}/databases/(default)/documents`;
  if (u === base + ':runQuery') { const q = JSON.parse(op.body).structuredQuery, f = q.where.fieldFilter;
    return Response.json(Object.entries(db).filter(([k, v]) => k.split('/')[0] === q.from[0].collectionId && v[f.field.fieldPath] === f.value.stringValue)
      .map(([k, v]) => ({document:{name: base + '/' + k, fields: Object.fromEntries(Object.entries(v).map(([a, b]) => [a, {stringValue:b}]))}}))); }
  const path = decodeURIComponent(u.slice(base.length + 1).split('?')[0]);
  if (op.method === 'PATCH') { const campos = JSON.parse(op.body).fields; db[path] = {...(db[path] || {}), ...Object.fromEntries(Object.entries(campos).map(([k, v]) => [k, dec(v)]))}; return Response.json({}); }
  if (op.method === 'DELETE') { delete db[path]; return Response.json({}); }
  if (!db[path]) return new Response('{}', {status:404});
  return Response.json({fields: Object.fromEntries(Object.entries(db[path]).map(([a, b]) => [a, {stringValue:b}]))});
};

const enviar = (corpo, hottok = env.HOTTOK) => worker.fetch(new Request('https://w.example.workers.dev/hotmart', {method:'POST', headers:{'content-type':'application/json', 'X-HOTMART-HOTTOK':hottok}, body:JSON.stringify(corpo)}), env);
// corpo igual ao "Enviar teste" da Hotmart (Webhook 2.0.0)
const teste = ev => ({id:'b8a8b0c4-teste', creation_date:1700000000000, event:ev, version:'2.0.0', data:{
  product:{id:0, ucode:'fb056612-bcc6-4217-9e6d-2a5d1110ac2f', name:'Produto test postback2'},
  buyer:{email:'testeComprador271101postman15@example.com', name:'Teste Comprador', checkout_phone:'99999999900'},
  purchase:{approved_date:1231241434453, order_date:1231241434453, status:'APPROVED', transaction:'HP16015479281022', offer:{code:'test'}},
  subscription:{status:'ACTIVE', plan:{id:123, name:'plano de teste'}, subscriber:{code:'I9OT62C3'}}}});

assert.equal((await worker.fetch(new Request('https://w.example.workers.dev/'), env)).status, 200);
assert.equal((await enviar(teste('PURCHASE_APPROVED'), 'errado')).status, 401, 'hottok errado é recusado');
assert.deepEqual(db, {}, 'nada gravado com hottok errado');

let r = await (await enviar(teste('PURCHASE_APPROVED'))).json();
assert.equal(r.acao, 'liberado');
assert.equal(db['compras/testecomprador271101postman15@example.com'].status, 'ativa');
assert.equal(db['transacoes/HP16015479281022'].status, 'ativa');

// aluno usou o código da transação numa conta com outro e-mail (o app grava isso)
db['transacoes/HP16015479281022'].usadoPor = 'uidOutraConta';
db['acessos/uidOutraConta'] = {hotmartTx:'HP16015479281022', email:'outro@gmail.com'};
db['acessos/uidConvite'] = {convite:'ABCDEFGHJK'}; // convite manual: não pode ser mexido

r = await (await enviar(teste('PURCHASE_REFUNDED'))).json();
assert.equal(r.acao, 'removido');
assert.equal(db['compras/testecomprador271101postman15@example.com'].status, 'cancelada');
assert.equal(db['transacoes/HP16015479281022'].status, 'cancelada');
assert.equal(db['transacoes/HP16015479281022'].usadoPor, 'uidOutraConta', 'histórico de uso mantido');
assert.ok(!db['acessos/uidOutraConta'], 'conta liberada pelo código perde o acesso');
assert.ok(db['acessos/uidConvite'], 'convite manual continua');

// nova compra aprovada reativa; cancelamento de assinatura (só tem o e-mail) remove de novo
await enviar(teste('PURCHASE_APPROVED'));
assert.equal(db['compras/testecomprador271101postman15@example.com'].status, 'ativa');
r = await (await enviar({event:'SUBSCRIPTION_CANCELLATION', version:'2.0.0', data:{product:{id:0, name:'Produto'}, subscriber:{code:'I9OT62C3', name:'Teste Comprador', email:'TesteComprador271101postman15@example.com'}, subscription:{id:1}}})).json();
assert.equal(r.acao, 'removido'); assert.deepEqual(r.transacoes, ['HP16015479281022']);
assert.equal(db['compras/testecomprador271101postman15@example.com'].status, 'cancelada');

// evento que não mexe no acesso, e produto fora da lista
assert.equal((await (await enviar(teste('PURCHASE_BILLET_PRINTED'))).json()).acao, 'ignorado');
env.PRODUTOS = '999'; assert.equal((await (await enviar(teste('PURCHASE_APPROVED'))).json()).acao, 'ignorado'); delete env.PRODUTOS;
assert.equal(tokens, 1, 'token do Google reaproveitado');
console.log('Todos os testes passaram ✓');
