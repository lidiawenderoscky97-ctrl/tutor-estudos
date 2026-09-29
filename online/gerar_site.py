# Gera o site com login (GitHub Pages, pasta docs/) a partir de app/index.html.
# Precisa de site/firebase-config.json (configuração pública do app web do Firebase).
import json, os, re, shutil
raiz = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
docs = os.path.join(raiz, 'docs'); os.makedirs(docs, exist_ok=True)
cfg_path = os.path.join(raiz, 'site', 'firebase-config.json')
if not os.path.exists(cfg_path):
    open(os.path.join(docs, 'index.html'), 'w', encoding='utf-8').write(
        '<!DOCTYPE html><html lang="pt-BR"><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1">'
        '<title>Tutor de Estudos</title><body style="font-family:system-ui;padding:32px"><h1>Tutor de Estudos</h1><p>Site em configuração. Volte em alguns minutos.</p></body></html>')
    print('sem configuração do Firebase: página provisória gerada'); raise SystemExit
cfg = json.load(open(cfg_path, encoding='utf-8'))
SDK = '12.19.0'
h = open(os.path.join(raiz, 'app', 'index.html'), encoding='utf-8').read()
loader = """<link rel="manifest" href="manifest.webmanifest">
<link rel="icon" href="icone.png">
<link rel="apple-touch-icon" href="icone.png">
<meta name="theme-color" content="#191a2e">
<meta name="apple-mobile-web-app-capable" content="yes">
<script>
window.FIREBASE_CONFIG = %s;
window.SDK_PRONTO = (function(){
  var v = '%s', fontes = ['https://www.gstatic.com/firebasejs/'+v+'/', 'https://cdn.jsdelivr.net/npm/firebase@'+v+'/'];
  function um(nome, i){ return new Promise(function(ok, erro){
    var s = document.createElement('script'); s.src = fontes[i] + nome;
    s.onload = ok; s.onerror = function(){ i+1 < fontes.length ? um(nome, i+1).then(ok, erro) : erro(new Error(nome)); };
    document.head.appendChild(s); }); }
  return ['firebase-app-compat.js','firebase-auth-compat.js','firebase-firestore-compat.js']
    .reduce(function(p, n){ return p.then(function(){ return um(n, 0); }); }, Promise.resolve());
})();
</script>
""" % (json.dumps(cfg), SDK)
h = h.replace('<!-- TUTOR-ESTUDOS-APP -->', '<!-- TUTOR-ESTUDOS-APP -->\n' + loader, 1)
open(os.path.join(docs, 'index.html'), 'w', encoding='utf-8').write(h)
shutil.copy(os.path.join(raiz, 'desktop', 'icone.png'), os.path.join(docs, 'icone.png'))
shutil.copy(os.path.join(raiz, 'versao.json'), os.path.join(docs, 'versao.json'))
json.dump({"name":"Tutor de Estudos","short_name":"Tutor","start_url":"./","display":"standalone",
           "background_color":"#f4f5fa","theme_color":"#191a2e","lang":"pt-BR",
           "icons":[{"src":"icone.png","sizes":"512x512","type":"image/png","purpose":"any"}]},
          open(os.path.join(docs, 'manifest.webmanifest'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
open(os.path.join(docs, '.nojekyll'), 'w').close()
print('site gerado em docs/ (SDK', SDK + ')')
