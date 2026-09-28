# Edital TJSP Escrevente reconstruído com os cadernos do TEC (guia TJ SP 2025, contagem de questões por assunto)
# e a distribuição real da prova VUNESP 07/12/2025 (questões por matéria).
# (matéria, questões na prova 2025, peso, [(assunto, questões no caderno TEC)])
M = [
("Língua Portuguesa", 16, 5, [
 ("Interpretação de textos e tipologia textual", 137),
 ("Reescrita de frases, substituição de trechos, clareza e correção", 73),
 ("Semântica: sinônimos, antônimos, sentido próprio e figurado, significação contextual", 142),
 ("Pronomes e colocação pronominal", 134),
 ("Verbos: tempos, modos, correlação verbal e vozes", 119),
 ("Substantivo, adjetivo, artigo, numeral e advérbio", 93),
 ("Preposição e conjunção", 66),
 ("Concordância verbal e nominal", 61),
 ("Partícula SE e vocábulos QUE e COMO", 59),
 ("Pontuação", 47),
 ("Coesão e coerência: conectores e referenciação", 44),
 ("Crase", 42),
 ("Regência verbal e nominal", 41),
 ("Tipos de discurso: direto, indireto e indireto livre", 21)]),
("Direito Administrativo", 6, 3, [
 ("Improbidade (Lei 8.429/92): atos de improbidade, arts. 9º a 11", 144),
 ("Improbidade (Lei 8.429/92): disposições gerais, arts. 1º a 8º-A", 115),
 ("Improbidade (Lei 8.429/92): penas, procedimento e prescrição, arts. 12 a 23-C", 138),
 ("Estatuto SP (Lei 10.261/68): penalidades, TAC e suspensão da sindicância, arts. 251 a 267-P", 97),
 ("Estatuto SP (Lei 10.261/68): provimento, exercício, vacância e direitos, arts. 1º a 240", 78),
 ("Estatuto SP (Lei 10.261/68): deveres, proibições e responsabilidades, arts. 241 a 250", 65),
 ("Estatuto SP (Lei 10.261/68): procedimento disciplinar, arts. 268 a 323", 42)]),
("Direito Processual Civil", 5, 3, [
 ("Recursos: disposições gerais, apelação, agravos e embargos de declaração, arts. 994 a 1.026", 137),
 ("Audiência de conciliação, contestação, reconvenção e revelia, arts. 334 a 346", 121),
 ("Citação, cartas e intimações, arts. 236 a 275", 113),
 ("Provas, arts. 369 a 484", 107),
 ("Sentença, coisa julgada e liquidação, arts. 485 a 512", 104),
 ("Juizados Especiais Cíveis (Lei 9.099/95) e da Fazenda Pública (Lei 12.153/09)", 95),
 ("Forma, tempo e lugar dos atos processuais, arts. 188 a 217", 90),
 ("Petição inicial e improcedência liminar, arts. 318 a 332", 80),
 ("Tutela provisória, arts. 294 a 311", 64),
 ("Cumprimento de sentença, arts. 513 a 538", 58),
 ("Prazos, arts. 218 a 235", 53),
 ("Saneamento, julgamento conforme o estado e audiência de instrução, arts. 347 a 368", 43),
 ("Impedimento, suspeição e auxiliares da justiça, arts. 144 a 155", 29)]),
("Direito Processual Penal", 5, 3, [
 ("Juizado Especial Criminal (Lei 9.099/95): disposições gerais e fase preliminar, arts. 60 a 76", 113),
 ("Juizado Especial Criminal (Lei 9.099/95): procedimento sumaríssimo e disposições finais, arts. 77 a 89", 53),
 ("Recursos: teoria geral, recurso em sentido estrito, apelação e embargos, arts. 574 a 620", 114),
 ("Citações e intimações, arts. 351 a 372", 111),
 ("Procedimento comum ordinário e sumário, sentença e restauração de autos, arts. 381 a 405, 531 a 548", 99),
 ("Tribunal do Júri, arts. 406 a 497", 70),
 ("Juiz, Ministério Público, acusado e defensor, arts. 251 a 267 e 274", 66),
 ("Revisão criminal e habeas corpus, arts. 621 a 667", 39)]),
("Direito Constitucional", 5, 3, [
 ("Direitos e deveres individuais e coletivos (art. 5º)", 328),
 ("Administração pública: disposições gerais (arts. 37 e 38)", 255),
 ("Remédios constitucionais", 98),
 ("Servidores públicos (arts. 39 a 41)", 98),
 ("Direitos sociais (arts. 6º a 11)", 96),
 ("Nacionalidade (arts. 12 e 13)", 59),
 ("Órgãos do Poder Judiciário (art. 92)", 7)]),
("Normas da Corregedoria Geral da Justiça", 5, 3, [
 ("NSCGJ Tomo I, Cap. III: Seções I a VII (arts. 26 a 34, 46 a 86)", 56),
 ("NSCGJ Tomo I, Cap. III: Seções XVII a XIX (arts. 157 a 189-G)", 55),
 ("NSCGJ Tomo I, Cap. XI (arts. 1.189 a 1.265)", 47),
 ("NSCGJ Tomo I, Cap. III: Seções IX a XV (arts. 103 a 142)", 39),
 ("NSCGJ Tomo I, Cap. II (arts. 5º a 18)", 38),
 ("NSCGJ Tomo I, Cap. III: Seção VIII (arts. 87 a 99)", 22)]),
("Direito Penal", 4, 2, [
 ("Concussão, excesso de exação e corrupção passiva (arts. 316 e 317)", 181),
 ("Peculato e crimes em sistemas de informação (arts. 312 a 313-B)", 177),
 ("Prevaricação, condescendência, advocacia administrativa, sigilo e demais crimes funcionais (arts. 314, 315, 319 a 325)", 157),
 ("Crimes de particular contra a administração (arts. 328 a 337)", 102),
 ("Falsidade documental (arts. 296 a 305)", 97),
 ("Crimes contra a administração da justiça (arts. 339 a 347, 357 e 359)", 50),
 ("Funcionário público para fins penais (art. 327)", 37),
 ("Papéis públicos, falsa identidade e fraude em certames (arts. 293 a 295, 307, 308, 311-A)", 35)]),
("Informática", 9, 4, [
 ("Internet, navegadores e sites de busca", 435),
 ("Windows 10 e 11", 383),
 ("MS-Excel", 292),
 ("MS-Word", 258),
 ("Correio eletrônico", 217),
 ("OneDrive e computação em nuvem", 82),
 ("Microsoft Teams", 42)]),
("Raciocínio Lógico", 6, 3, [
 ("Sequências numéricas, de figuras e de letras (inclui PA e PG)", 344),
 ("Lógica de argumentação e diagramas lógicos", 320),
 ("Equivalências lógicas e negação de proposições", 242),
 ("Associação de informações e verdade/mentira", 119),
 ("Datas, calendários, orientação espacial e outros problemas", 111),
 ("Proposições, conectivos e tabela-verdade", 46)]),
("Matemática", 5, 3, [
 ("Geometria plana e espacial", 286),
 ("Médias, gráficos e tabelas", 201),
 ("Equações de 1º e 2º grau", 189),
 ("Razão, proporção e regra de três", 163),
 ("Porcentagem", 150),
 ("Números naturais, divisibilidade, MMC e MDC", 143),
 ("Frações, decimais e números reais", 141),
 ("Unidades de medida", 103),
 ("Sistemas lineares", 53),
 ("Juros simples", 20)]),
("Atualidades", 3, 2, [
 ("Política nacional e internacional", 97),
 ("Economia nacional e internacional", 47),
 ("Meio ambiente e sustentabilidade", 37),
 ("Ciência e tecnologia", 29),
 ("Cultura, sociedade, saúde, educação e outros temas", 63)]),
("Estatuto da Pessoa com Deficiência", 1, 1, [
 ("Disposições gerais, igualdade e não discriminação (arts. 1º a 9º)", 245),
 ("Direito à vida e ao trabalho (arts. 10 a 13 e 34 a 38)", 36)]),
]
REDACAO = ("Redação", 3, [("Estrutura do texto dissertativo-argumentativo",3),("Argumentação e repertório",2),("Coesão, coerência e norma culta",2),("Prática com temas no estilo VUNESP",3)])

AULA={'Interpretação de textos e tipologia textual': 'Aula 09', 'Reescrita de frases, substituição de trechos, clareza e correção': 'Aulas 07 e 09', 'Semântica: sinônimos, antônimos, sentido próprio e figurado, significação contextual': 'Aula 08', 'Pronomes e colocação pronominal': 'Aula 01', 'Verbos: tempos, modos, correlação verbal e vozes': 'Aula 03', 'Substantivo, adjetivo, artigo, numeral e advérbio': 'Aula 01', 'Preposição e conjunção': 'Aula 02', 'Concordância verbal e nominal': 'Aula 05', 'Partícula SE e vocábulos QUE e COMO': 'Aulas 01 e 02', 'Pontuação': 'Aula 04', 'Coesão e coerência: conectores e referenciação': 'Aula 07', 'Crase': 'Aula 06', 'Regência verbal e nominal': 'Aula 06', 'Tipos de discurso: direto, indireto e indireto livre': 'Aula 09', 'Improbidade (Lei 8.429/92): atos de improbidade, arts. 9º a 11': 'Aula 03', 'Improbidade (Lei 8.429/92): disposições gerais, arts. 1º a 8º-A': 'Aula 03', 'Improbidade (Lei 8.429/92): penas, procedimento e prescrição, arts. 12 a 23-C': 'Aula 03', 'Estatuto SP (Lei 10.261/68): penalidades, TAC e suspensão da sindicância, arts. 251 a 267-P': 'Aula 02', 'Estatuto SP (Lei 10.261/68): provimento, exercício, vacância e direitos, arts. 1º a 240': 'Aula 01', 'Estatuto SP (Lei 10.261/68): deveres, proibições e responsabilidades, arts. 241 a 250': 'Aula 02', 'Estatuto SP (Lei 10.261/68): procedimento disciplinar, arts. 268 a 323': 'Aula 02', 'Recursos: disposições gerais, apelação, agravos e embargos de declaração, arts. 994 a 1.026': 'Aula 08', 'Audiência de conciliação, contestação, reconvenção e revelia, arts. 334 a 346': 'Aula 04', 'Citação, cartas e intimações, arts. 236 a 275': 'Aula 02', 'Provas, arts. 369 a 484': 'Aulas 05 e 06', 'Sentença, coisa julgada e liquidação, arts. 485 a 512': 'Aula 07', 'Juizados Especiais Cíveis (Lei 9.099/95) e da Fazenda Pública (Lei 12.153/09)': 'Aula 09', 'Forma, tempo e lugar dos atos processuais, arts. 188 a 217': 'Aula 01', 'Petição inicial e improcedência liminar, arts. 318 a 332': 'Aula 04', 'Tutela provisória, arts. 294 a 311': 'Aula 03', 'Cumprimento de sentença, arts. 513 a 538': 'Aulas 04 e 07', 'Prazos, arts. 218 a 235': 'Aula 01', 'Saneamento, julgamento conforme o estado e audiência de instrução, arts. 347 a 368': 'Aula 04', 'Impedimento, suspeição e auxiliares da justiça, arts. 144 a 155': 'Aula 00', 'Juizado Especial Criminal (Lei 9.099/95): disposições gerais e fase preliminar, arts. 60 a 76': 'Aula 06', 'Juizado Especial Criminal (Lei 9.099/95): procedimento sumaríssimo e disposições finais, arts. 77 a 89': 'Aula 06', 'Recursos: teoria geral, recurso em sentido estrito, apelação e embargos, arts. 574 a 620': 'Aula 04', 'Citações e intimações, arts. 351 a 372': 'Aula 01', 'Procedimento comum ordinário e sumário, sentença e restauração de autos, arts. 381 a 405, 531 a 548': 'Aula 02', 'Tribunal do Júri, arts. 406 a 497': 'Aula 03', 'Juiz, Ministério Público, acusado e defensor, arts. 251 a 267 e 274': 'Aula 00', 'Revisão criminal e habeas corpus, arts. 621 a 667': 'Aulas 04 e 05', 'Direitos e deveres individuais e coletivos (art. 5º)': 'Aulas 00 a 02', 'Administração pública: disposições gerais (arts. 37 e 38)': 'Aula 05', 'Remédios constitucionais': 'Aulas 01 e 02', 'Servidores públicos (arts. 39 a 41)': 'Aula 05', 'Direitos sociais (arts. 6º a 11)': 'Aula 03', 'Nacionalidade (arts. 12 e 13)': 'Aula 04', 'Órgãos do Poder Judiciário (art. 92)': 'Aula 06', 'NSCGJ Tomo I, Cap. III: Seções I a VII (arts. 26 a 34, 46 a 86)': 'Aulas 02 e 03', 'NSCGJ Tomo I, Cap. III: Seções XVII a XIX (arts. 157 a 189-G)': 'Aulas 07 e 08', 'NSCGJ Tomo I, Cap. XI (arts. 1.189 a 1.265)': 'conferir no curso', 'NSCGJ Tomo I, Cap. III: Seções IX a XV (arts. 103 a 142)': 'Aulas 05 e 06', 'NSCGJ Tomo I, Cap. II (arts. 5º a 18)': 'Aula 01', 'NSCGJ Tomo I, Cap. III: Seção VIII (arts. 87 a 99)': 'Aula 04', 'Concussão, excesso de exação e corrupção passiva (arts. 316 e 317)': 'Aula 01', 'Peculato e crimes em sistemas de informação (arts. 312 a 313-B)': 'Aula 01', 'Prevaricação, condescendência, advocacia administrativa, sigilo e demais crimes funcionais (arts. 314, 315, 319 a 325)': 'Aula 01', 'Crimes de particular contra a administração (arts. 328 a 337)': 'Aula 02', 'Falsidade documental (arts. 296 a 305)': 'Aula 00', 'Crimes contra a administração da justiça (arts. 339 a 347, 357 e 359)': 'Aula 03', 'Funcionário público para fins penais (art. 327)': 'Aula 01', 'Papéis públicos, falsa identidade e fraude em certames (arts. 293 a 295, 307, 308, 311-A)': 'Aula 00', 'Internet, navegadores e sites de busca': 'Aulas 00 e 01', 'Windows 10 e 11': 'Aulas 05 e 06', 'MS-Excel': 'Aula 03', 'MS-Word': 'Aula 04', 'Correio eletrônico': 'Aula 02', 'OneDrive e computação em nuvem': 'Aula 07', 'Microsoft Teams': 'Aula 07', 'Sequências numéricas, de figuras e de letras (inclui PA e PG)': 'Aula 05', 'Lógica de argumentação e diagramas lógicos': 'Aulas 03 e 04', 'Equivalências lógicas e negação de proposições': 'Aula 02', 'Associação de informações e verdade/mentira': 'Aula 07', 'Datas, calendários, orientação espacial e outros problemas': 'Aulas 06 e 07', 'Proposições, conectivos e tabela-verdade': 'Aulas 00 e 01', 'Geometria plana e espacial': 'Aulas 17 e 18', 'Médias, gráficos e tabelas': 'Aulas 19 e 20', 'Equações de 1º e 2º grau': 'Aula 16', 'Razão, proporção e regra de três': 'Aulas 12 e 13', 'Porcentagem': 'Aula 14', 'Números naturais, divisibilidade, MMC e MDC': 'Aulas 09 e 11', 'Frações, decimais e números reais': 'Aulas 08, 09 e 12', 'Unidades de medida': 'Aula 10', 'Sistemas lineares': 'Aula 16', 'Juros simples': 'Aula 15', 'Política nacional e internacional': 'Retrospectivas mensais', 'Economia nacional e internacional': 'Retrospectivas mensais', 'Meio ambiente e sustentabilidade': 'Retrospectivas mensais', 'Ciência e tecnologia': 'Retrospectivas mensais', 'Cultura, sociedade, saúde, educação e outros temas': 'Retrospectivas mensais', 'Disposições gerais, igualdade e não discriminação (arts. 1º a 9º)': 'Atualidades, Aula 01', 'Direito à vida e ao trabalho (arts. 10 a 13 e 34 a 38)': 'Atualidades, Aula 01', 'Estrutura do texto dissertativo-argumentativo': 'Aulas 00 a 02', 'Argumentação e repertório': 'Aulas 01 e 02', 'Coesão, coerência e norma culta': 'Aula 02', 'Prática com temas no estilo VUNESP': 'Aulas 04 a 06'}
CURSO={'Língua Portuguesa': 'Língua Portuguesa', 'Direito Administrativo': 'Direito Administrativo (Prof. Antonio Daud)', 'Direito Processual Civil': 'Direito Processual Civil', 'Direito Processual Penal': 'Direito Processual Penal', 'Direito Constitucional': 'Direito Constitucional', 'Normas da Corregedoria Geral da Justiça': 'Legislação Especial TJ-SP', 'Direito Penal': 'Direito Penal', 'Informática': 'Informática', 'Raciocínio Lógico': 'Raciocínio Lógico e Matemática', 'Matemática': 'Raciocínio Lógico e Matemática', 'Atualidades': 'Atualidades', 'Estatuto da Pessoa com Deficiência': 'Atualidades', 'Redação': 'Redação Sem Correção'}
def incid(c, tot, n):
    r = (c/tot)/(1/n)
    return 3 if r >= 1.25 else (1 if r < 0.5 else 2)

L = ["// TJSP – Escrevente Técnico Judiciário · base: edital VUNESP 2025 (prova de 07/12/2025)",
     "// Peso: nº de questões de cada matéria na prova de 2025. Incidência: participação do assunto no caderno do guia TEC TJ SP 2025.",
     "// Nota mínima: 50% nos Blocos I (Português) e II (Direito). Bloco III é classificatório. Redação eliminatória.",
     "@concurso: TJSP – Escrevente Técnico Judiciário", "@banca: VUNESP", ""]
for nome, q, peso, tops in M:
    tot = sum(c for _,c in tops); n = len(tops)
    L.append(f"// {nome}: {q} questões na prova 2025 · {tot} questões no caderno TEC")
    L.append(f"{nome} | {peso} | 3 | Pré-Edital TJ-SP (Escrevente) {CURSO[nome]}")
    for t,c in tops: L.append(f"- {t} *{incid(c,tot,n)} [{AULA[t]}]")
    L.append("")
nome, peso, tops = REDACAO
L.append("// Redação: prova discursiva eliminatória (40 pontos)")
L.append(f"{nome} | {peso} | 3 | Pré-Edital TJ-SP (Escrevente) {CURSO[nome]}")
for t,i in tops: L.append(f"- {t} *{i} [{AULA[t]}]")
open('/home/claude/tutor-estudos/concursos/tjsp-escrevente.txt','w').write("\n".join(L)+"\n")
print(sum(len(x[3]) for x in M)+4, "assuntos;", sum(x[1] for x in M), "questões")
