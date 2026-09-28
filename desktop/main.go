package main

import (
	_ "embed"
	"encoding/json"
	"fmt"
	"io"
	"net"
	"net/http"
	"os"
	"os/exec"
	"path/filepath"
	"strconv"
	"sync/atomic"
	"syscall"
	"time"

	webview2 "github.com/jchv/go-webview2"
	"golang.org/x/sys/windows"
)

//go:embed index.html
var pagina []byte

var pasta, arquivo string

func pastaDocumentos() string {
	if p, err := windows.KnownFolderPath(windows.FOLDERID_Documents, 0); err == nil && p != "" {
		return p
	}
	h, _ := os.UserHomeDir()
	return filepath.Join(h, "Documents")
}

func aviso(titulo, texto string, flags uint32) int32 {
	t, _ := syscall.UTF16PtrFromString(titulo)
	m, _ := syscall.UTF16PtrFromString(texto)
	r, _ := windows.MessageBox(0, m, t, flags)
	return r
}

func gravar(dados string) error {
	if err := os.MkdirAll(pasta, 0o755); err != nil {
		return err
	}
	tmp := arquivo + ".tmp"
	if err := os.WriteFile(tmp, []byte(dados), 0o644); err != nil {
		return err
	}
	if b, err := os.ReadFile(arquivo); err == nil {
		_ = os.WriteFile(filepath.Join(pasta, "dados-anterior.json"), b, 0o644)
	}
	return os.Rename(tmp, arquivo)
}

func main() {
	// Apenas uma janela aberta por vez, para não haver dois programas gravando os mesmos dados
	nome, _ := syscall.UTF16PtrFromString("TutorDeEstudos-InstanciaUnica")
	if _, err := windows.CreateMutex(nil, false, nome); err == windows.ERROR_ALREADY_EXISTS {
		aviso("Tutor de Estudos", "O Tutor de Estudos já está aberto.", windows.MB_ICONINFORMATION)
		return
	}

	pasta = filepath.Join(pastaDocumentos(), "Tutor de Estudos")
	arquivo = filepath.Join(pasta, "dados.json")

	local := os.Getenv("LOCALAPPDATA")
	if local == "" {
		local = os.TempDir()
	}
	carregarInterface(local)

	// Servidor local só para esta janela (endereço 127.0.0.1, porta aleatória).
	// "/" entrega a interface; "/dados" lê e grava o arquivo de dados do usuário.
	ln, err := net.Listen("tcp", "127.0.0.1:0")
	if err != nil {
		aviso("Tutor de Estudos", "Não foi possível iniciar o programa: "+err.Error(), windows.MB_ICONERROR)
		return
	}
	go http.Serve(ln, http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Cache-Control", "no-store")
		switch r.URL.Path {
		case "/dados":
			if r.Method == http.MethodPost {
				b, err := io.ReadAll(io.LimitReader(r.Body, 200<<20))
				if err == nil && json.Valid(b) {
					err = gravar(string(b))
				} else if err == nil {
					err = fmt.Errorf("dados inválidos")
				}
				if err != nil {
					http.Error(w, err.Error(), 500)
					return
				}
				w.Write([]byte("ok"))
				return
			}
			b, err := os.ReadFile(arquivo)
			if err != nil {
				w.WriteHeader(204)
				return
			}
			w.Header().Set("Content-Type", "application/json; charset=utf-8")
			w.Write(b)
		case "/":
			html, _ := paginaAtual()
			w.Header().Set("Content-Type", "text/html; charset=utf-8")
			w.Write(html)
		default:
			http.NotFound(w, r)
		}
	}))

	w := webview2.NewWithOptions(webview2.WebViewOptions{
		AutoFocus: true,
		DataPath:  filepath.Join(local, "TutorDeEstudos", "WebView2"),
		WindowOptions: webview2.WindowOptions{
			Title: "Tutor de Estudos", Width: 1200, Height: 820, IconId: 2, Center: true,
		},
	})
	if w == nil {
		r := aviso("Tutor de Estudos",
			"Este programa precisa do Microsoft Edge WebView2, que não foi encontrado neste computador.\n\n"+
				"Deseja abrir a página oficial da Microsoft para instalá-lo? (é gratuito e rápido)",
			windows.MB_YESNO|windows.MB_ICONWARNING)
		if r == 6 { // IDYES
			exec.Command("rundll32", "url.dll,FileProtocolHandler",
				"https://developer.microsoft.com/microsoft-edge/webview2/").Start()
		}
		return
	}
	defer w.Destroy()
	w.SetSize(420, 500, webview2.HintMin)

	w.Bind("goAbrirPasta", func() error {
		_ = os.MkdirAll(pasta, 0o755)
		return exec.Command("explorer.exe", pasta).Start()
	})
	// A interface avisa que abriu sem erros
	w.Bind("goOk", func(v int) { atomic.StoreInt64(&okVersao, int64(v)) })

	avisarPagina := func(v int, notas string, erro string) {
		w.Dispatch(func() {
			w.Eval("window.__atualizacao && window.__atualizacao(" + strconv.Itoa(v) + "," + jsStr(notas) + "," + jsStr(erro) + ")")
		})
	}
	verificar := func(manual bool) {
		v, notas, err := buscarAtualizacao()
		if err != nil {
			if manual {
				avisarPagina(0, "", err.Error())
			}
			return
		}
		if v > 0 || manual {
			avisarPagina(v, notas, "")
		}
	}
	// Verificação manual (botão em Configurações): roda em segundo plano para não travar a janela
	w.Bind("goVerificar", func() { go verificar(true) })

	w.Init(`window.desktop = {
  ler: function(){ var x = new XMLHttpRequest(); x.open('GET', '/dados', false); x.send(); return x.status === 200 ? x.responseText : null; },
  gravar: function(j){ try { var x = new XMLHttpRequest(); x.open('POST', '/dados', false); x.setRequestHeader('Content-Type','application/json'); x.send(j); return x.status === 200; } catch(e) { return false; } },
  abrirPasta: function(){ window.goAbrirPasta(); },
  verificar: function(){ window.goVerificar(); },
  ok: function(v){ window.goOk(v); }
};`)

	url := "http://" + ln.Addr().String() + "/"
	w.Navigate(url)

	go func() {
		// Proteção: se uma versão baixada não abrir direito em 20s, volta para a anterior
		time.Sleep(20 * time.Second)
		_, v := paginaAtual()
		if v > versaoEmbut && int(atomic.LoadInt64(&okVersao)) != v {
			restaurarSeguro()
			w.Dispatch(func() { w.Navigate(url) })
		}
	}()
	go func() {
		// Procura atualizações ao abrir e depois a cada 3 horas
		time.Sleep(4 * time.Second)
		for {
			verificar(false)
			time.Sleep(3 * time.Hour)
		}
	}()

	w.Run()
}

var okVersao int64

func jsStr(s string) string { b, _ := json.Marshal(s); return string(b) }
