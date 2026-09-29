async function tecColetor(){
  if(!/tecconcursos\.com\.br$/.test(location.hostname)){ alert('Abra o TEC Concursos, entre em Guias → seu concurso → seu cargo e clique neste favorito lá.'); return; }
  const links = [...document.querySelectorAll('a')].filter(a => /ver detalhes/i.test(a.textContent) && /\/guias\//.test(a.pathname));
  if(!links.length){ alert('Não achei os cadernos do Guia nesta página. Abra Guias → seu concurso → seu cargo (a página com "Cadernos por matéria") e clique de novo.'); return; }
  const velho = document.getElementById('eg-coletor'); if(velho) velho.remove();
  const box = document.createElement('div'); box.id = 'eg-coletor';
  box.style.cssText = 'position:fixed;z-index:2147483647;top:16px;right:16px;width:400px;max-width:92vw;background:#fff;color:#111;border:2px solid #4f46e5;border-radius:12px;padding:14px;font:14px/1.4 sans-serif;box-shadow:0 8px 30px rgba(0,0,0,.25)';
  box.innerHTML = '<b style="color:#4f46e5">Estudo Guiado</b><div id="eg-msg" style="margin:8px 0">Lendo os cadernos…</div>'; document.body.appendChild(box);
  const msg = t => { box.querySelector('#eg-msg').textContent = t; };
  const urls = [...new Set(links.map(a => a.href))]; let feitos = 0, falhas = 0; const blocos = new Array(urls.length);
  const fila = urls.map((u, i) => [u, i]);
  const trabalhar = async () => { while(fila.length){ const [u, i] = fila.shift();
    try{ const html = await (await fetch(u, {credentials:'include'})).text();
      const d = new DOMParser().parseFromString(html, 'text/html'); d.querySelectorAll('script,style,noscript').forEach(e => e.remove());
      const L = d.body.textContent.split('\n').map(s => s.replace(/\s+/g, ' ').trim()).filter(Boolean);
      const titulo = (d.querySelector('h1') || {}).textContent || ''; const out = [];
      for(let k = 1; k < L.length; k++) if(/^(\d{1,6}|uma)\s+quest(ões|oes|ão|ao)\b/i.test(L[k]) && !/quest(ões|oes|ão|ao)\b/i.test(L[k-1])) out.push(L[k-1], L[k].replace(/^uma/i, '1'));
      blocos[i] = '@@caderno ' + u + ' | ' + titulo.replace(/\s+/g, ' ').trim() + '\n' + out.join('\n');
    }catch(e){ falhas++; }
    feitos++; msg('Lendo os cadernos… (' + feitos + '/' + urls.length + ')'); } };
  await Promise.all([trabalhar(), trabalhar(), trabalhar()]);
  const txt = 'ESTUDO-GUIADO-TEC\n' + blocos.filter(Boolean).join('\n');
  box.querySelector('#eg-msg').innerHTML = 'Pronto: ' + (urls.length - falhas) + ' cadernos lidos' + (falhas ? ' (' + falhas + ' com erro — clique de novo se precisar)' : '') + '. Clique em <b>Copiar</b> e cole no Estudo Guiado (Edital → Incidência pelo caderno do TEC).';
  const ta = document.createElement('textarea'); ta.value = txt; ta.style.cssText = 'width:100%;height:70px;font-size:11px'; box.appendChild(ta);
  const bt = document.createElement('button'); bt.textContent = 'Copiar'; bt.style.cssText = 'margin-top:8px;padding:7px 16px;background:#4f46e5;color:#fff;border:0;border-radius:8px;font-weight:600;cursor:pointer';
  bt.onclick = async () => { try{ await navigator.clipboard.writeText(txt); }catch(e){ ta.select(); document.execCommand('copy'); } bt.textContent = 'Copiado ✓'; };
  const fe = document.createElement('button'); fe.textContent = 'Fechar'; fe.style.cssText = 'margin:8px 0 0 8px;padding:7px 12px;background:#eee;border:0;border-radius:8px;cursor:pointer'; fe.onclick = () => box.remove();
  box.appendChild(bt); box.appendChild(fe);
}