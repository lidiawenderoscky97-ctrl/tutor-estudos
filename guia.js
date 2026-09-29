const norm = s => String(s||'').normalize('NFD').replace(/[̀-ͯ]/g,'').toLowerCase();
const TEC_PARE = new Set('de da do das dos e em a o as os para com no na nos nas ao aos por sobre entre ou um uma que se questoes questao mescladas mesclados outras outros topicos casos gerais geral disposicoes lei n no nº art arts cf cp cpp cpc cf88 ate parte i ii iii iv v vi vii secao secoes capitulo cap tomo nao demais variadas assuntos dispositivos envolvendo exercicios inclui etc'.split(' '));
function tecTokens(s){ return norm(s).replace(/(\d)\.(\d{3})/g,'$1$2').split(/[^a-z0-9]+/).filter(w => w && !TEC_PARE.has(w) && !/^\d+$/.test(w) && w.length>2); }
function tecLeis(s){ return (norm(s).replace(/(\d)\.(\d{3})/g,'$1$2').match(/\b(\d{4,5})\s*\/\s*\d{2,4}\b|\blei\s*(?:n[ºo.]*\s*)?(\d{4,5})/g)||[]).map(x=>(x.match(/\d{4,5}/)||[''])[0]); }
function tecArtigos(s){
  const t = norm(s).replace(/(\d)\.(\d{3})/g,'$1$2'); const iv = [];
  const re = /arts?\.?\s*([\d][\d\-a-z;,\s]*(?:\s(?:a|ao|e)\s[\d][\d\-a-z;,\s]*)*)/g; let m;
  while((m = re.exec(t))){ const seg = m[1];
    const r = /(\d{1,4})(?:-[a-z])?(?:\s*(?:a|ao)\s*(\d{1,4}))?/g; let k;
    while((k = r.exec(seg))){ const a = +k[1], b = k[2] ? +k[2] : a; if(a>0 && a<2000 && b>=a && b-a<600) iv.push([a,b]); } }
  return iv;
}
function tecSobreposicao(A,B){
  if(!A.length || !B.length) return 0; let s = 0, la = 0;
  A.forEach(([a1,a2]) => { la += a2-a1+1; B.forEach(([b1,b2]) => { const o = Math.min(a2,b2)-Math.max(a1,b1)+1; if(o>0) s += o; }); });
  return Math.min(1, s/la);
}
function tecSoFolhas(itens, arvore){
  const n = itens.length, memo = new Map(), escolha = new Map(), fimPai = new Map();
  const arts = itens.map(x => tecArtigos(x.nome));
  const folga = p => { const q = itens[p].q; return Math.max(Math.min(3, Math.floor(q * 0.1)), Math.floor(q * 0.03)); };
  const cabe = (i, p) => !arts[i].length || !arts[p].length || tecSobreposicao(arts[i], arts[p]) >= 0.999;
  let passos = 0;
  function filhos(i, alvo, p){
    if(alvo === 0) return i;
    const k = i + '|' + alvo + '|' + p;
    if(memo.has(k)) return memo.get(k);
    memo.set(k, -1);
    let r = -1;
    if(i < n && ++passos < 300000 && cabe(i, p) && itens[i].q <= alvo + folga(p)){
      const fp = paiAte(i);
      for(const fim of (fp > i + 1 ? [fp, i + 1] : [i + 1])){
        const resto = filhos(fim, alvo - itens[i].q, p);
        if(resto >= 0){ r = resto; escolha.set(k, fim); break; }
      }
    }
    if(r < 0 && i > p + 1 && Math.abs(alvo) <= folga(p)) r = i;
    memo.set(k, r); return r;
  }
  function paiAte(p){                  // fim dos filhos de p, ou -1 se p não é grupo
    if(fimPai.has(p)) return fimPai.get(p);
    fimPai.set(p, -1);
    let fim = p + 1 < n && itens[p].q > 0 ? filhos(p + 1, itens[p].q, p) : -1;
    if(fim === p + 2 && itens[p + 1].q !== itens[p].q) fim = -1;   // um filho só, sem bater o total: não é grupo
    fimPai.set(p, fim); return fim;
  }
  const folhas = [], raizes = [];
  function montar(p, pais, no){
    let i = p + 1, alvo = itens[p].q;
    while(true){
      const fim = escolha.get(i + '|' + alvo + '|' + p);
      if(fim === undefined) break;
      const filho = {nome:itens[i].nome, q:itens[i].q, filhos:[]}; no.filhos.push(filho);
      if(fim > i + 1) montar(i, pais.concat(itens[i].nome), filho);
      else folhas.push({nome:itens[i].nome, q:itens[i].q, contexto:pais.join(' '), caminho:pais.slice()});
      alvo -= itens[i].q; i = fim;
    }
    if(alvo >= 3 && pais.length > 1) folhas.push({nome:itens[p].nome, q:alvo, contexto:pais.slice(0, -1).join(' '), caminho:pais.slice(0, -1), sobra:true});
  }
  let i = 0;
  while(i < n){
    const fp = paiAte(i), no = {nome:itens[i].nome, q:itens[i].q, filhos:[]}; raizes.push(no);
    if(fp > i + 1){ montar(i, [itens[i].nome], no); i = fp; }
    else { folhas.push({nome:itens[i].nome, q:itens[i].q, contexto:'', caminho:[]}); i++; }
  }
  return arvore ? raizes : folhas;
}
function tecItensBrutos(txt){
  const L = String(txt).split(/\r?\n/).map(s=>s.replace(/\s+/g,' ').trim().replace(/^uma quest(ão|ao)\b/i,'1 questão')).filter(Boolean), itens = [];
  for(let i=1;i<L.length;i++){ const m = L[i].match(/^(\d{1,6})\s+quest(?:ões|oes|ão|ao)\b/i); if(m && !/quest(?:ões|oes|ão|ao)\b/i.test(L[i-1]) && !/^@@/.test(L[i-1])) itens.push({nome:L[i-1], q:+m[1]}); }
  return itens;
}
function tecAssuntosDaArvore(raizes){
  const total = raizes.reduce((s,r)=>s+r.q,0) || 1;
  let nos = raizes.flatMap(r => r.filhos.length ? r.filhos : [r]);   // a raiz é o nome da matéria no TEC
  for(let k = 0; k < 80 && nos.length < 40; k++){
    const sh = x => x.q / total;
    const cand = nos.filter(x => x.filhos.length >= 2 && (sh(x) > .2 || (nos.length < 12 && sh(x) > .04) || (nos.length < 25 && sh(x) > .1))).sort((a,b)=>b.q-a.q)[0];
    if(!cand) break;
    const i = nos.indexOf(cand); nos.splice(i, 1, ...cand.filhos);
  }
  nos = nos.filter(x => x.q > 0);
  const pouco = nos.filter(x => x.q < Math.max(3, total * .012));   // assuntos com pouquíssimas questões viram um só
  if(pouco.length >= 2){ nos = nos.filter(x => !pouco.includes(x)); nos.push({nome:'Demais assuntos (pouco cobrados): ' + pouco.map(x=>x.nome.replace(/\s*\(.*?\)\s*/g,' ').trim()).slice(0,6).join('; ') + (pouco.length>6?'…':''), q: pouco.reduce((s,x)=>s+x.q,0), filhos:[]}); }
  return nos;
}
function editalDoGuia(txt){
  const guia = (txt.match(/^@@guia (.*)$/m)||[])[1] || '', banca = ((txt.match(/^@@banca (.*)$/m)||[])[1] || '').trim();
  const blocos = txt.split(/^(?=@@caderno )/m).filter(b => /^@@caderno /.test(b));
  const mats = [];
  blocos.forEach(b => {
    const cab = b.match(/^@@caderno (\S+)(?: \| (.*))?/); const titulo = (cab[2]||'').trim();
    if(/^(in[ée]ditas|simulado|quest[õo]es in[ée]ditas|revis[ãa]o)/i.test(titulo)) return;
    const nome = titulo.replace(/\s+para\s+.*$/i, '').replace(/\s+-\s+.*\b(19|20)\d{2}\s*$/, '').trim() || titulo;
    const nos = tecAssuntosDaArvore(tecSoFolhas(tecItensBrutos(b), true));
    if(nos.length) mats.push({nome, link: cab[1], nos, total: nos.reduce((s,x)=>s+x.q,0)});
  });
  // concurso: "Guia TC DF / 2026 para concurso Analista ..." → "TC DF 2026 – Analista ..."
  let concurso = guia.replace(/^Guia\s+/i,'').replace(/\s*\/\s*/,' ').replace(/\s+para concurso\s+/i,' – ').trim();
  if(!concurso && blocos.length){ const t = (blocos[0].match(/ \| (.*)/)||[])[1]||''; concurso = (t.match(/\s+para\s+(.*)$/i)||[])[1] || ''; }
  const L = [`// Criado a partir dos cadernos do Guia do TEC. Incidência = nº de questões de cada assunto nos cadernos.`, `@concurso: ${concurso}`, `@banca: ${banca}`];
  mats.forEach(m => { const media = m.total / m.nos.length;
    L.push('', `${m.nome.replace(/\|/g,'/')} | 3 | 3`, `@tec: ${m.link}`);
    m.nos.forEach(x => L.push(`- ${x.nome.replace(/[\[\]]/g, s => s==='['?'(':')').replace(/[#*|]/g,' ').replace(/\s+/g,' ').trim()} *${tecNivel(x.q, media)} %${x.q}`));
  });
  return {texto: L.join('\n'), materias: mats.length, assuntos: mats.reduce((s,m)=>s+m.nos.length,0), concurso};
}
function tecNivel(q, media){ const r = q/(media||1); return r>=1.25 ? 3 : r<0.5 ? 1 : 2; }
