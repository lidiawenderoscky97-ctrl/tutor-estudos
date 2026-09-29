# Tutor de Estudos

Sistema de estudos para concursos: edital verticalizado, ciclo adaptativo, revisões espaçadas e análise de desempenho.

## Como funciona a atualização

- `desktop/`: o programa do Windows (a "casca"). Só abre a janela, salva os dados e busca atualizações.
- `app/index.html`: a interface. O programa baixa daqui automaticamente.
- `versao.json`: número da versão publicada. O programa só baixa quando este número aumenta.
- `concursos/`: catálogo de editais verticalizados usado pela busca de concurso (`indice.json` + um arquivo por concurso).

Os dados de estudo ficam apenas no computador, em `Documentos\Tutor de Estudos\dados.json`, e nunca são enviados para cá.

## Publicar uma nova versão da interface

1. Edite `app/index.html` e aumente `<meta name="versao" content="N">`.
2. Atualize `versao.json` com o mesmo número e uma nota curta.

## Versão online (celular, tablet, computador)

- `online/gerar.py` gera `online/tutor-estudos.html` a partir de `app/index.html`, com o catálogo de concursos embutido.
- Essa página é publicada no Claude (privada) e guarda o progresso na conta: `tutor/estado` e, por mês, `tutor/estado/sessoes/AAAA-MM` e `tutor/estado/metas/AAAA-MM`.
