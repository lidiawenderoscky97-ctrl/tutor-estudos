/**
 * Estudo Guiado – liberação automática de acesso pelas vendas da Hotmart (Cloudflare Worker, plano gratuito).
 *
 * A Hotmart avisa este Worker (Webhook 2.0) a cada evento de venda. O Worker confere o Hottok e grava no Firestore:
 *   compras/<e-mail do comprador>  → {email, nome, transacao, status:'ativa'|'cancelada', evento, produto, atualizado}
 *   transacoes/<código da transação> → {email, nome, status, evento, produto, atualizado}  (+ usadoPor, quando o
 *                                        aluno usa o código para liberar uma conta Google com outro e-mail)
 * Compra aprovada/completa → status 'ativa'. Cancelamento de assinatura, reembolso, chargeback ou compra cancelada →
 * status 'cancelada' e as contas liberadas pelo código daquela compra perdem o acesso (acessos/<uid> apagado).
 *
 * Segredos (Cloudflare → Worker → Settings → Variables and Secrets, tipo "Secret"):
 *   HOTTOK                 – o Hottok da sua conta Hotmart (Ferramentas → Webhook)
 *   FIREBASE_PROJECT_ID    – tutor-estudos-f380b
 *   FIREBASE_CLIENT_EMAIL  – "client_email" do arquivo JSON da conta de serviço do Firebase
 *   FIREBASE_PRIVATE_KEY   – "private_key" do mesmo arquivo (o texto inteiro, com BEGIN/END)
 * Opcional (variável comum):
 *   PRODUTOS               – IDs dos produtos da Hotmart aceitos, separados por vírgula (vazio = todos)
 */

const LIBERA = new Set(['PURCHASE_APPROVED', 'PURCHASE_COMPLETE']);
const REMOVE = new Set(['PURCHASE_CANCELED', 'PURCHASE_REFUNDED', 'PURCHASE_CHARGEBACK', 'SUBSCRIPTION_CANCELLATION']);

export default {
  async fetch(req, env, ctx) {
    const url = new URL(req.url);
    if (req.method === 'GET') return texto('Estudo Guiado · Webhook da Hotmart funcionando. Cadastre esta URL (terminando em /hotmart) na Hotmart.');
    if (req.method !== 'POST' || !/\/hotmart\/?$/.test(url.pathname)) return texto('Use POST em /hotmart', 404);
    let corpo;
    try { corpo = await req.json(); } catch (e) { return texto('JSON inválido', 400); }
    // Hottok: no cabeçalho (Webhook 2.0) ou no corpo (versões antigas)
    const hottok = req.headers.get('X-HOTMART-HOTTOK') || req.headers.get('x-hotmart-hottok') || corpo.hottok || '';
    if (!env.HOTTOK || !iguais(String(hottok), String(env.HOTTOK))) return texto('Hottok inválido', 401);
    try {
      const r = await processar(corpo, env);
      console.log(JSON.stringify({evento: corpo.event, ...r}));
      return Response.json({ok: true, ...r});
    } catch (e) {
      console.log('ERRO', e && e.stack || e);
      return Response.json({ok: false, erro: String(e && e.message || e)}, {status: 500}); // a Hotmart tenta de novo
    }
  },
};

// ---------- regras de negócio ----------
export async function processar(corpo, env, fs = firestore(env)) {
  const ev = String(corpo.event || '').toUpperCase(), d = corpo.data || {};
  const prod = d.product || {}, compra = d.purchase || {};
  const email = limpaEmail((d.buyer && d.buyer.email) || (d.subscriber && d.subscriber.email) || '');
  const nome = String((d.buyer && d.buyer.name) || (d.subscriber && d.subscriber.name) || '').slice(0, 120);
  const tx = String(compra.transaction || '').trim().toUpperCase();
  const aceitos = String(env.PRODUTOS || '').split(',').map(s => s.trim()).filter(Boolean);
  if (aceitos.length && prod.id != null && !aceitos.includes(String(prod.id))) return {acao: 'ignorado', motivo: 'produto fora da lista'};
  if (!LIBERA.has(ev) && !REMOVE.has(ev)) return {acao: 'ignorado', motivo: 'evento sem efeito no acesso'};
  if (!email && !tx) return {acao: 'ignorado', motivo: 'sem e-mail e sem transação'};
  const base = {evento: ev, produto: String(prod.name || ''), produtoId: String(prod.id ?? ''), atualizado: new Date().toISOString()};

  if (LIBERA.has(ev)) {
    if (email) await fs.merge(`compras/${email}`, {...base, email, nome, transacao: tx, status: 'ativa'});
    if (tx) await fs.merge(`transacoes/${tx}`, {...base, email, nome, status: 'ativa'});
    return {acao: 'liberado', email, tx};
  }
  // remoção: pela transação (reembolso, chargeback, cancelada) ou pelo e-mail (cancelamento de assinatura)
  const txs = new Set(tx ? [tx] : []);
  if (!tx && email) (await fs.query('transacoes', 'email', email)).forEach(x => txs.add(x.id));
  for (const t of txs) {
    await fs.merge(`transacoes/${t}`, {...base, status: 'cancelada'});
    for (const a of await fs.query('acessos', 'hotmartTx', t)) await fs.remove(`acessos/${a.id}`);
  }
  if (email) {
    const atual = await fs.get(`compras/${email}`);
    // só cancela o acesso do e-mail se foi esta a compra que o liberou (ou se é cancelamento de assinatura)
    if (atual && (!tx || !atual.transacao || atual.transacao === tx || ev === 'SUBSCRIPTION_CANCELLATION'))
      await fs.merge(`compras/${email}`, {...base, status: 'cancelada'});
  }
  return {acao: 'removido', email, transacoes: [...txs]};
}

const limpaEmail = e => String(e || '').trim().toLowerCase().replace(/\//g, '');
function iguais(a, b) { if (a.length !== b.length) return false; let r = 0; for (let i = 0; i < a.length; i++) r |= a.charCodeAt(i) ^ b.charCodeAt(i); return r === 0; }
const texto = (t, status = 200) => new Response(t, {status, headers: {'content-type': 'text/plain; charset=utf-8'}});

// ---------- Firestore (REST + conta de serviço) ----------
let tokenCache = null;
async function tokenGoogle(env) {
  if (tokenCache && tokenCache.exp > Date.now() + 60000) return tokenCache.token;
  const agora = Math.floor(Date.now() / 1000);
  const cab = b64url(JSON.stringify({alg: 'RS256', typ: 'JWT'}));
  const dados = b64url(JSON.stringify({iss: env.FIREBASE_CLIENT_EMAIL, scope: 'https://www.googleapis.com/auth/datastore',
    aud: 'https://oauth2.googleapis.com/token', iat: agora, exp: agora + 3600}));
  const pem = String(env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n').replace(/-----[^-]+-----/g, '').replace(/\s+/g, '');
  const chave = await crypto.subtle.importKey('pkcs8', Uint8Array.from(atob(pem), c => c.charCodeAt(0)), {name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256'}, false, ['sign']);
  const assin = new Uint8Array(await crypto.subtle.sign('RSASSA-PKCS1-v1_5', chave, new TextEncoder().encode(cab + '.' + dados)));
  const jwt = cab + '.' + dados + '.' + b64url(assin);
  const r = await fetch('https://oauth2.googleapis.com/token', {method: 'POST', headers: {'content-type': 'application/x-www-form-urlencoded'},
    body: 'grant_type=urn%3Aietf%3Aparams%3Aoauth%3Agrant-type%3Ajwt-bearer&assertion=' + jwt});
  const j = await r.json(); if (!j.access_token) throw new Error('Firebase recusou a chave: ' + JSON.stringify(j));
  tokenCache = {token: j.access_token, exp: Date.now() + (j.expires_in || 3600) * 1000};
  return tokenCache.token;
}
function b64url(x) { const s = typeof x === 'string' ? btoa(unescape(encodeURIComponent(x))) : btoa(String.fromCharCode(...x)); return s.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''); }
const valor = v => typeof v === 'number' ? {integerValue: String(v)} : typeof v === 'boolean' ? {booleanValue: v} : {stringValue: String(v ?? '')};
const ler = f => Object.fromEntries(Object.entries(f || {}).map(([k, v]) => [k, v.stringValue ?? v.integerValue ?? v.booleanValue ?? v.timestampValue ?? null]));
export function firestore(env, http = fetch) {
  const raiz = `https://firestore.googleapis.com/v1/projects/${env.FIREBASE_PROJECT_ID}/databases/(default)/documents`;
  const cam = p => p.split('/').map(encodeURIComponent).join('/');
  const req = async (u, op = {}) => { const t = await tokenGoogle(env); const r = await http(u, {...op, headers: {...(op.headers || {}), authorization: 'Bearer ' + t, 'content-type': 'application/json'}});
    if (r.status === 404) return null; const j = await r.json().catch(() => ({})); if (!r.ok) throw new Error('Firestore ' + r.status + ': ' + JSON.stringify(j)); return j; };
  return {
    async get(p) { const j = await req(`${raiz}/${cam(p)}`); return j && j.fields ? ler(j.fields) : null; },
    async merge(p, obj) { const ks = Object.keys(obj); await req(`${raiz}/${cam(p)}?` + ks.map(k => 'updateMask.fieldPaths=' + encodeURIComponent(k)).join('&'),
      {method: 'PATCH', body: JSON.stringify({fields: Object.fromEntries(ks.map(k => [k, valor(obj[k])]))})}); },
    async remove(p) { await req(`${raiz}/${cam(p)}`, {method: 'DELETE'}); },
    async query(col, campo, v) { const j = await req(`${raiz}:runQuery`, {method: 'POST', body: JSON.stringify({structuredQuery: {from: [{collectionId: col}],
      where: {fieldFilter: {field: {fieldPath: campo}, op: 'EQUAL', value: {stringValue: v}}}, limit: 50}})});
      return (j || []).filter(x => x.document).map(x => ({id: x.document.name.split('/').pop(), ...ler(x.document.fields)})); },
  };
}
