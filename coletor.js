async function estColetor(){
  if(!/estrategiaconcursos\.com\.br$/.test(location.hostname)){ alert('Abra o site do Estratégia Concursos (logado na sua conta) e clique neste favorito lá.'); return; }
  const velho = document.getElementById('eg-coletor'); if(velho) velho.remove();
  const box = document.createElement('div'); box.id = 'eg-coletor';
  box.style.cssText = 'position:fixed;z-index:2147483647;top:16px;right:16px;width:400px;max-width:92vw;background:#fff;color:#111;border:2px solid #4f46e5;border-radius:12px;padding:14px;font:14px/1.4 sans-serif;box-shadow:0 8px 30px rgba(0,0,0,.25)';
  box.innerHTML = '<b style="color:#4f46e5">Estudo Guiado</b><div id="eg-msg" style="margin:8px 0">Lendo seus cursos…</div>';
  document.body.appendChild(box);
  const msg = t => { box.querySelector('#eg-msg').textContent = t + (document.hidden ? ' — deixe esta aba aberta na frente para terminar.' : ''); };
  const ler = (url, re) => new Promise(ok => {
    const f = document.createElement('iframe'); f.style.cssText = 'position:fixed;left:-10000px;top:0;width:1280px;height:900px'; f.src = url; document.body.appendChild(f);
    let ult = -1, desde = Date.now(); const ini = Date.now();
    const iv = setInterval(() => { let as = [];
      try{ as = [...f.contentDocument.querySelectorAll('a')].filter(a => re.test(a.pathname)); }catch(e){}
      if(as.length !== ult){ ult = as.length; desde = Date.now(); }
      if((as.length && Date.now() - desde >= 3000 && Date.now() - ini >= 5000) || Date.now() - ini > 40000){ clearInterval(iv); const r = as.map(a => [a.pathname, (a.innerText || a.textContent || '').replace(/\s+/g, ' ').trim()]); f.remove(); ok(r); } }, 250); });
  const lista = await ler('/app/dashboard/cursos', /^\/app\/dashboard\/cursos\/\d+\/aulas\/?$/);
  const vistos = new Set(), todos = [];
  lista.forEach(([p, t]) => { const id = p.match(/cursos\/(\d+)/)[1]; if(vistos.has(id)) return; vistos.add(id);
    todos.push({id, titulo: t.replace(/Dispon[íi]vel entre.*$/i, '').trim(), aulas: []}); });
  if(!todos.length){ msg('Não encontrei cursos em "Minhas Matrículas". Confira se você está logado e tente de novo.'); return; }
  // agrupa as matrículas por concurso ("TJ-SP (Escrevente Judiciário) Língua Portuguesa" → "TJ-SP (Escrevente Judiciário)")
  const grupoDe = t => { const s = t.replace(/^(Pr[ée]|P[óo]s)-?\s*Edital\s*/i, '').replace(/^(Simulados?|Sprint[^-–:]*|Reta Final|Bizu[^-–:]*|Curso Regular( para)?)\s*[-–:]?\s*/i, '').trim();
    const sig = s.match(/^([A-ZÀ-Þ0-9]{2,}(?:-[A-Z0-9]{1,4})?)(?=[\s(:–-]|$)/); if(sig) return sig[1];
    return s.split(/\s[-–:]\s|\s\(/)[0].trim() || s; };
  const grupos = {}; todos.forEach(c => { const g = grupoDe(c.titulo); (grupos[g] = grupos[g] || []).push(c); });
  const nomes = Object.keys(grupos).sort((a, b) => grupos[b].length - grupos[a].length);
  box.querySelector('#eg-msg').innerHTML = 'Marque o concurso que você está estudando (' + todos.length + ' matrículas):';
  const lst = document.createElement('div'); lst.style.cssText = 'max-height:260px;overflow:auto;border:1px solid #ddd;border-radius:8px;padding:6px;margin:6px 0';
  nomes.forEach((g, i) => { const l = document.createElement('label'); l.style.cssText = 'display:block;padding:3px 0;cursor:pointer';
    const cb = document.createElement('input'); cb.type = 'checkbox'; cb.value = g; cb.style.marginRight = '6px'; l.appendChild(cb);
    l.appendChild(document.createTextNode(g + ' (' + grupos[g].length + ' curso' + (grupos[g].length > 1 ? 's' : '') + ')')); lst.appendChild(l); });
  box.appendChild(lst);
  const ir = document.createElement('button'); ir.textContent = 'Ler as aulas'; ir.style.cssText = 'padding:7px 16px;background:#4f46e5;color:#fff;border:0;border-radius:8px;font-weight:600;cursor:pointer';
  box.appendChild(ir);
  const marcados = await new Promise(ok => { ir.onclick = () => { const v = [...lst.querySelectorAll('input:checked')].map(x => x.value); if(v.length) ok(v); }; });
  lst.remove(); ir.remove();
  const cursos = marcados.flatMap(g => grupos[g]);
  let feitos = 0; msg('Lendo as aulas de ' + cursos.length + ' cursos… (0/' + cursos.length + ')');
  const fila = cursos.slice();
  const trabalhar = async () => { while(fila.length){ const c = fila.shift();
    const re = new RegExp('^/app/dashboard/cursos/' + c.id + '/aulas/\\d+/?$');
    let as = await ler('/app/dashboard/cursos/' + c.id + '/aulas', re);
    if(!as.length) as = await ler('/app/dashboard/cursos/' + c.id + '/aulas', re); // tenta de novo se a página demorou
    const ja = new Set();
    as.forEach(([p, t]) => { const aid = p.match(/aulas\/(\d+)/)[1]; if(ja.has(aid)) return; ja.add(aid);
      const m = t.match(/Aula\s*(\d+)/i); c.aulas.push([m ? m[1].padStart(2, '0') : '', aid, t.replace(/^Aula\s*\d+\s*(-\s*Somente em PDF)?\s*/i, '').trim()]); });
    feitos++; msg('Lendo as aulas de ' + cursos.length + ' cursos… (' + feitos + '/' + cursos.length + ')'); } };
  await Promise.all([trabalhar(), trabalhar(), trabalhar()]);
  const txt = 'ESTUDO-GUIADO-ESTRATEGIA ' + JSON.stringify({v: 1, cursos});
  box.querySelector('#eg-msg').innerHTML = 'Pronto: ' + cursos.length + ' cursos lidos. Clique em <b>Copiar</b> e cole no Estudo Guiado (Edital → Cursos do Estratégia).';
  const ta = document.createElement('textarea'); ta.value = txt; ta.style.cssText = 'width:100%;height:70px;font-size:11px'; box.appendChild(ta);
  const bt = document.createElement('button'); bt.textContent = 'Copiar'; bt.style.cssText = 'margin-top:8px;padding:7px 16px;background:#4f46e5;color:#fff;border:0;border-radius:8px;font-weight:600;cursor:pointer';
  bt.onclick = async () => { try{ await navigator.clipboard.writeText(txt); }catch(e){ ta.select(); document.execCommand('copy'); } bt.textContent = 'Copiado ✓'; };
  const fe = document.createElement('button'); fe.textContent = 'Fechar'; fe.style.cssText = 'margin:8px 0 0 8px;padding:7px 12px;background:#eee;border:0;border-radius:8px;cursor:pointer'; fe.onclick = () => box.remove();
  box.appendChild(bt); box.appendChild(fe);
}