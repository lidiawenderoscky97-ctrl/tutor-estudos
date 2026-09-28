package main

// Atualização automática da interface.
// O .exe é só a "casca": a interface (index.html) é baixada do repositório no GitHub
// e guardada em %LOCALAPPDATA%\TutorDeEstudos\interface. Os dados do usuário
// ficam em outro lugar (Documentos\Tutor de Estudos) e nunca são tocados aqui.

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"path/filepath"
	"regexp"
	"strconv"
	"strings"
	"sync"
	"time"
)

// Definido na compilação: -ldflags "-X main.repoBase=https://raw.githubusercontent.com/<usuario>/<repo>/main/"
var repoBase = ""

var (
	mu           sync.RWMutex
	htmlAtual    []byte
	versaoAtual  int
	versaoOk     int // última versão que confirmou ter carregado sem erro
	dirInterface string
	versaoEmbut  int
	reVersao     = regexp.MustCompile(`<meta name="versao" content="(\d+)"`)
)

func versaoDe(b []byte) int {
	m := reVersao.FindSubmatch(b)
	if m == nil {
		return 0
	}
	v, _ := strconv.Atoi(string(m[1]))
	return v
}

func valida(b []byte) bool {
	return len(b) > 10000 && bytes.Contains(b, []byte("TUTOR-ESTUDOS-APP")) &&
		bytes.Contains(b, []byte("</html>")) && versaoDe(b) > 0
}

func arqRuins() string { return filepath.Join(dirInterface, "versoes-com-problema.txt") }

func ruim(v int) bool {
	b, _ := os.ReadFile(arqRuins())
	for _, s := range strings.Fields(string(b)) {
		if s == strconv.Itoa(v) {
			return true
		}
	}
	return false
}

func marcarRuim(v int) {
	f, err := os.OpenFile(arqRuins(), os.O_APPEND|os.O_CREATE|os.O_WRONLY, 0o644)
	if err == nil {
		fmt.Fprintf(f, "%d\n", v)
		f.Close()
	}
}

func definir(b []byte) {
	mu.Lock()
	htmlAtual, versaoAtual = b, versaoDe(b)
	mu.Unlock()
}

func paginaAtual() ([]byte, int) {
	mu.RLock()
	defer mu.RUnlock()
	return htmlAtual, versaoAtual
}

// Escolhe a melhor interface disponível: a baixada (se for mais nova e sem problemas) ou a embutida.
func carregarInterface(local string) {
	dirInterface = filepath.Join(local, "TutorDeEstudos", "interface")
	_ = os.MkdirAll(dirInterface, 0o755)
	versaoEmbut = versaoDe(pagina)
	definir(pagina)
	for _, nome := range []string{"index.html", "anterior.html"} {
		if b, err := os.ReadFile(filepath.Join(dirInterface, nome)); err == nil && valida(b) {
			if v := versaoDe(b); v > versaoEmbut && !ruim(v) {
				definir(b)
				return
			}
		}
	}
}

func baixar(c *http.Client, url string) ([]byte, error) {
	resp, err := c.Get(url + "?t=" + strconv.FormatInt(time.Now().Unix(), 10))
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()
	if resp.StatusCode != 200 {
		return nil, fmt.Errorf("HTTP %d", resp.StatusCode)
	}
	return io.ReadAll(io.LimitReader(resp.Body, 20<<20))
}

// Procura uma versão nova no GitHub. Retorna (nova versão, notas) quando baixou algo novo.
func buscarAtualizacao() (int, string, error) {
	if repoBase == "" {
		return 0, "", fmt.Errorf("repositório de atualizações não configurado")
	}
	c := &http.Client{Timeout: 20 * time.Second}
	b, err := baixar(c, repoBase+"versao.json")
	if err != nil {
		return 0, "", err
	}
	var info struct {
		Versao int    `json:"versao"`
		Notas  string `json:"notas"`
	}
	if err := json.Unmarshal(b, &info); err != nil {
		return 0, "", err
	}
	_, atual := paginaAtual()
	if info.Versao <= atual || ruim(info.Versao) {
		return 0, "", nil
	}
	html, err := baixar(c, repoBase+"app/index.html")
	if err != nil {
		return 0, "", err
	}
	if !valida(html) || versaoDe(html) != info.Versao {
		return 0, "", fmt.Errorf("arquivo de atualização inválido")
	}
	idx := filepath.Join(dirInterface, "index.html")
	if old, err := os.ReadFile(idx); err == nil && valida(old) {
		_ = os.WriteFile(filepath.Join(dirInterface, "anterior.html"), old, 0o644)
	}
	tmp := idx + ".tmp"
	if err := os.WriteFile(tmp, html, 0o644); err != nil {
		return 0, "", err
	}
	if err := os.Rename(tmp, idx); err != nil {
		return 0, "", err
	}
	definir(html)
	return info.Versao, info.Notas, nil
}

// Se uma versão baixada não confirmar que abriu (erro no código), volta para a anterior.
func restaurarSeguro() {
	_, v := paginaAtual()
	marcarRuim(v)
	definir(pagina)
	if b, err := os.ReadFile(filepath.Join(dirInterface, "anterior.html")); err == nil && valida(b) {
		if va := versaoDe(b); va > versaoEmbut && !ruim(va) {
			definir(b)
		}
	}
}
