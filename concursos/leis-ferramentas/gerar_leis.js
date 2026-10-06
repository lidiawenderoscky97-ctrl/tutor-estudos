// Gera concursos/leis/<id>.txt e indice.json a partir dos textos das fontes oficiais.
// Uso: node gerar_leis.js <pasta com <id>.txt das fontes>
// As fontes vêm do ramo "leis-fonte" (GitHub Actions baixa do Planalto, ALESP, SINJ-DF e TJSP) e passam por html2txt.py.
// O leitor de leis é o mesmo do app (trecho "Lei seca: leitura do texto da lei" em app/index.html).
const fs = require('fs'), path = require('path');
const raiz = path.join(__dirname, '..', '..');
const app = fs.readFileSync(path.join(raiz, 'app', 'index.html'), 'utf8');
const ini = app.indexOf('/* ============ Lei seca: leitura do texto da lei'), fim = app.indexOf('/* ============ fim da leitura da lei');
const norm = s => String(s||'').normalize('NFD').replace(/[̀-ͯ]/g,'').toLowerCase();
const meta = JSON.parse(fs.readFileSync(path.join(__dirname, 'leis.json'), 'utf8'));
const src = process.argv[2], out = path.join(raiz, 'concursos', 'leis'), hoje = new Date().toISOString().slice(0,10);
eval(app.slice(ini, fim) + `
const indice = [];
for(const m of meta){
  const f = path.join(src, m.id + '.txt'); if(!fs.existsSync(f)){ console.log('sem fonte:', m.id); continue; }
  const lei = leiDoTexto(fs.readFileSync(f, 'utf8'), {pdf: !!m.pdf, inicio: m.inicio});
  const txt = leiParaTexto(lei, {id:m.id, nome:m.nome, sigla:m.sigla, fonte:m.fonte, atualizado:hoje});
  fs.writeFileSync(path.join(out, m.id + '.txt'), txt + '\\n');
  const nd = lei.arts.reduce((s,a) => s + a.d.length, 0);
  indice.push({id:m.id, nome:m.nome, sigla:m.sigla, numero:m.numero||'', apelidos:m.apelidos||[], arts:lei.arts.length, disp:nd, kb:Math.round(txt.length/1024), esfera:m.esfera||'federal', atualizado:hoje});
  console.log(m.id.padEnd(9), lei.arts.length, 'artigos', nd, 'dispositivos');
}
fs.writeFileSync(path.join(out, 'indice.json'), JSON.stringify(indice, null, 1) + '\\n');
`);
