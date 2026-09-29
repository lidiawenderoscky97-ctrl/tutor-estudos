# Gera a versão online (página no Claude) a partir de app/index.html:
# - tira <!DOCTYPE>/<html>/<head>/<body> (a página publicada ganha esse esqueleto automaticamente)
# - embute o catálogo de concursos (a página online não pode buscar arquivos no GitHub)
import json, os, re
raiz = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
h = open(os.path.join(raiz, 'app', 'index.html'), encoding='utf-8').read()
head = re.search(r'<head>(.*)</head>', h, re.S).group(1)
body = re.search(r'<body>(.*)</body>', h, re.S).group(1)
head = re.sub(r'<meta charset="UTF-8">\s*', '', head)
head = re.sub(r'<meta name="viewport"[^>]*>\s*', '', head)
head = re.sub(r'<!-- TUTOR-ESTUDOS-APP -->\s*', '', head)
# <title> primeiro
titulo = re.search(r'<title>.*?</title>', head).group(0)
head = titulo + '\n' + head.replace(titulo, '', 1).strip()
cat_dir = os.path.join(raiz, 'concursos')
cat = {f: open(os.path.join(cat_dir, f), encoding='utf-8').read() for f in os.listdir(cat_dir) if f.endswith(('.json', '.txt'))}
emb = '<script>window.CATALOGO_EMBUTIDO=' + json.dumps(cat, ensure_ascii=False).replace('</', '<\\/') + ';</script>\n'
body = body.replace('<script>', emb + '<script>', 1)
out = os.path.join(raiz, 'online', 'tutor-estudos.html')
open(out, 'w', encoding='utf-8').write(head.strip() + '\n' + body.strip() + '\n')
print(out, os.path.getsize(out), 'bytes')
