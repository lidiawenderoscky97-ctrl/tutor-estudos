# Converte o HTML de uma lei (Planalto, ALESP, SINJ-DF) em texto: um parágrafo por linha,
# sem o texto tachado (redações revogadas). O texto vira lei estruturada no app (leiDoTexto).
import sys, re
from bs4 import BeautifulSoup, NavigableString

def decodificar(b):
    if b[:2] in (b'\xff\xfe', b'\xfe\xff'): return b.decode('utf-16', 'replace')
    cab = b[:3000].decode('ascii', 'ignore').lower()
    m = re.search(r'charset=["\']?([\w-]+)', cab)
    enc = (m.group(1) if m else 'utf-8')
    if enc in ('iso-8859-1', 'latin1', 'latin-1', 'windows-1252'): enc = 'cp1252'
    try: return b.decode(enc)
    except Exception: return b.decode('cp1252', 'replace')

def converter(html):
    soup = BeautifulSoup(html, 'lxml')
    for t in soup(['script', 'style', 'head', 'strike', 's', 'del', 'noscript']): t.decompose()
    for t in soup.find_all(style=re.compile(r'line-through', re.I)): t.decompose()
    for t in soup.find_all(class_=re.compile(r'tachad|revogad|strike', re.I)): t.decompose()
    for s in list(soup.find_all(string=True)):
        if isinstance(s, NavigableString): s.replace_with(re.sub(r'\s+', ' ', str(s)))
    for t in soup.find_all(['p', 'div', 'br', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'li', 'tr', 'table', 'center', 'blockquote']):
        t.insert_before('\n')
        if t.name != 'br': t.insert_after('\n')
    txt = soup.get_text('')
    linhas = [re.sub(r'\s+', ' ', l).strip() for l in txt.split('\n')]
    return '\n'.join(l for l in linhas if l)

if __name__ == '__main__':
    print(converter(decodificar(open(sys.argv[1], 'rb').read())))
