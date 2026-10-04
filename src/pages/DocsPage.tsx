import { useCallback, useRef, useState } from 'react';
import {
  ArrowLeft,
  AudioLines,
  BookOpen,
  Cpu,
  Download,
  Eye,
  FileText,
  Globe,
  Keyboard,
  Layers,
  ListFilter,
  Lock,
  Moon,
  Search,
  Sliders,
  Sparkles,
  Sun,
  Volume2,
  X,
} from 'lucide-react';
import { useTranslation } from '../i18n/I18nContext';

interface Props {
  onNavigateHome: () => void;
  theme?: 'dark' | 'light';
  onToggleTheme?: () => void;
}

export default function DocsPage({ onNavigateHome, theme = 'dark', onToggleTheme }: Props) {
  const { locale, setLocale, t } = useTranslation();
  const [activeSection, setActiveSection] = useState('visao-geral');
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const mainRef = useRef<HTMLElement>(null);
  const isClickingRef = useRef(false);

  const sections = [
    { id: 'visao-geral', title: 'Visao Geral', icon: BookOpen },
    { id: 'formatos-midia', title: 'Entrada e Formatos de Midia', icon: FileText },
    { id: 'processamento-audio', title: 'Engenharia de Audio (DSP)', icon: Volume2 },
    { id: 'calibracao-video', title: 'Calibracao Visual e Imagem', icon: Eye },
    { id: 'exportacao-video', title: 'Exportacao e Download de Video', icon: Download },
    { id: 'inteligencia-artificial', title: 'Inteligencia Artificial', icon: Sparkles },
    { id: 'ferramentas-estudo', title: 'Ferramentas de Estudo', icon: Sliders },
    { id: 'atalhos-teclado', title: 'Atalhos de Teclado', icon: Keyboard },
    { id: 'arquitetura-tecnica', title: 'Grafo Web Audio', icon: Cpu },
    { id: 'seguranca', title: 'Privacidade e Seguranca', icon: Lock },
  ];

  const filteredSections = sections.filter((s) =>
    s.title.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleScroll = useCallback(() => {
    if (isClickingRef.current) return;
    const container = mainRef.current;
    if (!container) return;

    const isAtBottom = container.scrollHeight - container.scrollTop <= container.clientHeight + 50;
    if (isAtBottom) {
      setActiveSection(sections[sections.length - 1].id);
      return;
    }

    const containerTop = container.getBoundingClientRect().top;
    let currentId = sections[0].id;

    for (const s of sections) {
      const el = document.getElementById(s.id);
      if (!el) continue;
      const rect = el.getBoundingClientRect();
      if (rect.top - containerTop <= 110) {
        currentId = s.id;
      }
    }
    setActiveSection(currentId);
  }, [sections]);

  const scrollToSection = (id: string) => {
    setActiveSection(id);
    isClickingRef.current = true;
    setMobileMenuOpen(false);
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
      window.setTimeout(() => {
        isClickingRef.current = false;
      }, 700);
    }
  };

  return (
    <div className="flex h-full flex-col bg-zinc-950 text-zinc-100 antialiased selection:bg-zinc-800 selection:text-white">
      <header className="flex h-14 items-center justify-between border-b border-zinc-900 bg-zinc-950 px-3 sm:px-6 shrink-0 z-30">
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            id="btn-back-player"
            onClick={onNavigateHome}
            className="flex items-center gap-1.5 rounded-md border border-zinc-800 bg-zinc-900/60 px-2.5 sm:px-3 py-1.5 text-xs font-medium text-zinc-300 hover:bg-zinc-800 hover:text-white transition shrink-0"
          >
            <ArrowLeft size={14} />
            <span className="hidden sm:inline">Voltar ao Player</span>
            <span className="sm:hidden">Voltar</span>
          </button>

          <div className="h-4 w-px bg-zinc-800 mx-1 sm:mx-2 shrink-0" />

          <button
            id="docs-logo-home"
            onClick={onNavigateHome}
            className="flex items-center gap-2 hover:opacity-80 transition text-left cursor-pointer focus:outline-none shrink-0"
            title="Ir para a tela inicial"
          >
            <div className="flex h-6 w-6 items-center justify-center rounded bg-zinc-100 text-zinc-950 font-bold shrink-0">
              <AudioLines size={14} />
            </div>
            <span className="text-sm font-semibold tracking-tight text-zinc-100">ClearView</span>
            <span className="rounded bg-zinc-900 border border-zinc-800 px-1.5 py-0.5 text-[10px] font-mono text-zinc-400">
              docs
            </span>
          </button>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 text-xs text-zinc-400">
          <button
            id="docs-lang-toggle"
            type="button"
            onClick={() => setLocale(locale === 'pt' ? 'en' : 'pt')}
            className="flex items-center gap-1 rounded-md border border-zinc-800 bg-zinc-900/60 px-2 py-1 text-xs font-medium text-zinc-300 hover:border-zinc-700 hover:text-white transition font-mono uppercase"
            title={locale === 'pt' ? 'Mudar para ingles' : 'Switch to Portuguese'}
          >
            <Globe size={13} />
            <span>{locale}</span>
          </button>
          {onToggleTheme && (
            <button
              id="docs-theme-toggle"
              type="button"
              onClick={onToggleTheme}
              className="flex items-center gap-1.5 rounded-md border border-zinc-800 bg-zinc-900/60 px-2.5 py-1 text-xs font-medium text-zinc-300 hover:border-zinc-700 hover:text-white transition"
              title={theme === 'dark' ? 'Mudar para tema claro' : 'Mudar para tema escuro'}
            >
              {theme === 'dark' ? <Sun size={13} /> : <Moon size={13} />}
              <span>{theme === 'dark' ? 'Claro' : 'Escuro'}</span>
            </button>
          )}
          <span className="font-mono text-[11px] text-zinc-500 hidden sm:inline">Versao 1.0.0</span>
        </div>
      </header>

      <div className="flex items-center justify-between border-b border-zinc-900 bg-zinc-950/90 px-3.5 py-2 md:hidden">
        <span className="text-xs text-zinc-400 truncate max-w-[200px]">
          {sections.find((s) => s.id === activeSection)?.title || 'Documentação'}
        </span>
        <button
          id="btn-mobile-topics"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="flex items-center gap-1.5 rounded border border-zinc-800 bg-zinc-900 px-2.5 py-1 text-xs font-medium text-zinc-200 transition hover:bg-zinc-850"
        >
          <ListFilter size={13} />
          <span>Topicos</span>
        </button>
      </div>

      <div className="relative flex flex-1 overflow-hidden">
        {mobileMenuOpen && (
          <div
            onClick={() => setMobileMenuOpen(false)}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs md:hidden"
          />
        )}

        <aside
          className={`fixed inset-y-0 left-0 z-50 w-72 border-r border-zinc-900 bg-zinc-950 p-4 shrink-0 flex flex-col gap-4 overflow-y-auto scrollbar-thin transition-transform duration-200 shadow-2xl md:static md:w-64 md:translate-x-0 md:shadow-none ${
            mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
          }`}
        >
          <div className="flex items-center justify-between md:hidden pb-2 border-b border-zinc-900">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Sumario de Topicos</span>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="rounded p-1 text-zinc-400 hover:text-white"
            >
              <X size={15} />
            </button>
          </div>

          <div className="relative">
            <Search size={13} className="absolute left-2.5 top-2.5 text-zinc-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filtrar topicos..."
              className="w-full rounded-md border border-zinc-900 bg-zinc-900/50 py-1.5 pl-8 pr-2.5 text-xs text-zinc-200 outline-none placeholder:text-zinc-600 focus:border-zinc-700"
            />
          </div>

          <nav className="space-y-0.5 text-xs">
            {filteredSections.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className={`flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-left transition ${
                    isActive
                      ? 'bg-zinc-100 font-semibold text-zinc-950'
                      : 'text-zinc-400 hover:bg-zinc-900/70 hover:text-zinc-200'
                  }`}
                >
                  <Icon size={14} className={isActive ? 'text-zinc-950' : 'text-zinc-500'} />
                  <span className="truncate">{item.title}</span>
                </button>
              );
            })}
          </nav>
        </aside>

        <main
          ref={mainRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto px-4 sm:px-8 py-6 sm:py-10 scrollbar-thin select-text min-w-0"
        >
          <div className="max-w-3xl space-y-12 pb-24 text-xs text-zinc-300 leading-relaxed">
            <section id="visao-geral" className="space-y-3 scroll-mt-6">
              <div className="flex items-center gap-2 text-zinc-400">
                <BookOpen size={16} />
                <span className="text-[11px] font-mono uppercase tracking-wider">Capitulo 1</span>
              </div>
              <h2 className="text-xl font-bold text-zinc-100">Visao Geral do Sistema</h2>
              <p>
                O ClearView Studio Player e uma plataforma de reproducao multimídia desenvolvida para resolver limitacoes frequentes de videos compartilhados na internet, tais como captacoes de audio abafadas, presenca de ruido constante de vento ou ventilacao, problemas de canal unico (audio tocando em apenas um fone) e ausencia de legendas.
              </p>
              <p>
                Toda a cadeia de sinal de audio e executada no cliente atraves da Web Audio API nativa, sem necessidade de enviar o video para servidores intermediarios ou instalar extensoes proprietarias.
              </p>
            </section>

            <div className="h-px bg-zinc-900" />

            <section id="formatos-midia" className="space-y-3 scroll-mt-6">
              <div className="flex items-center gap-2 text-zinc-400">
                <FileText size={16} />
                <span className="text-[11px] font-mono uppercase tracking-wider">Capitulo 2</span>
              </div>
              <h2 className="text-xl font-bold text-zinc-100">Entrada e Formatos de Midia</h2>
              <p>
                O software suporta arquivos locais e remotos nos seguintes formatos de encapsulamento:
              </p>
              <ul className="list-disc pl-5 space-y-1 text-zinc-300">
                <li><strong>MP4:</strong> Formato universal recomendado com codec de video H.264 ou H.265 e audio AAC.</li>
                <li><strong>WebM:</strong> Formato aberto com codecs VP8 ou VP9 e audio Vorbis ou Opus.</li>
                <li><strong>MOV:</strong> Arquivos gerados por dispositivos Apple e cameras digitais.</li>
                <li><strong>MKV:</strong> Suporte condicionado aos codecs internos compativeis com o navegador do usuario.</li>
              </ul>
              <div className="rounded-md border border-zinc-900 bg-zinc-900/40 p-3 space-y-1.5">
                <span className="font-semibold text-zinc-200">Requisito para URLs Remotas (CORS):</span>
                <p className="text-zinc-400">
                  Para carregar videos via URL direta, o servidor que hospeda o arquivo precisa enviar o cabecalho HTTP <code>Access-Control-Allow-Origin: *</code>. Sem esse cabecalho, os mecanismos de protecao entre origens do navegador impedem a leitura dos dados para processamento de audio e transcricao.
                </p>
              </div>
            </section>

            <div className="h-px bg-zinc-900" />

            <section id="processamento-audio" className="space-y-4 scroll-mt-6">
              <div className="flex items-center gap-2 text-zinc-400">
                <Volume2 size={16} />
                <span className="text-[11px] font-mono uppercase tracking-wider">Capitulo 3</span>
              </div>
              <h2 className="text-xl font-bold text-zinc-100">Engenharia e Restauracao de Audio (DSP)</h2>
              <p>
                O processador de audio conta com modulos dedicados para limpeza, equalizacao e gerenciamento de ganho:
              </p>

              <div className="space-y-3">
                <div className="rounded-md border border-zinc-900 bg-zinc-950 p-3 space-y-1">
                  <h4 className="font-semibold text-zinc-200">Visualizador de Espectro FFT</h4>
                  <p className="text-zinc-400">
                    Calcula a transformada rapida de Fourier (FFT) do sinal a cada quadro de animacao (60 quadros por segundo), exibindo 36 colunas de frequencia entre 20 Hz e 20 kHz. Permite ao operador observar exatamente a banda onde se concentram ruidos indesejados.
                  </p>
                </div>

                <div className="rounded-md border border-zinc-900 bg-zinc-950 p-3 space-y-1">
                  <h4 className="font-semibold text-zinc-200">Matriz de Canais e Downmix (Correcao de Fone Unico)</h4>
                  <p className="text-zinc-400">
                    O canal divisor separa os sinais L e R. Atraves de quatro nos de ganho independentes, e possivel redistribuir os canais nos modos:
                  </p>
                  <ul className="list-disc pl-5 text-zinc-400 space-y-0.5 mt-1">
                    <li>Estereo: Reproducao natural de dois canais.</li>
                    <li>Mono: Mescla L e R em proporcao de 50% para ambas as saidas.</li>
                    <li>So L: Clona o canal esquerdo para o fone direito (corrige captacoes mono no canal 1).</li>
                    <li>So R: Clona o canal direito para o fone esquerdo.</li>
                  </ul>
                </div>

                <div className="rounded-md border border-zinc-900 bg-zinc-950 p-3 space-y-1">
                  <h4 className="font-semibold text-zinc-200">Equalizador de 5 Bandas</h4>
                  <p className="text-zinc-400">
                    Composto por filtros parametricos nos pontos 60 Hz (low-shelf), 250 Hz (peaking), 1 kHz (peaking), 4 kHz (peaking) e 12 kHz (high-shelf), permitindo ganhos de -12 dB ate +12 dB.
                  </p>
                </div>

                <div className="rounded-md border border-zinc-900 bg-zinc-950 p-3 space-y-1">
                  <h4 className="font-semibold text-zinc-200">Noise Gate Dinamico</h4>
                  <p className="text-zinc-400">
                    Calcula o valor quadratico medio (RMS) continuo do sinal. Sempre que o nivel se mantem inferior ao limiar ajustado (por exemplo, -45 dB), uma atenuacao automatica de -22 dB e acionada em 50 milissegundos para silenciar chiados e ruidos de fundo entre as oracoes. Ao detectar fala, o portao se abre instantaneamente em 8 milissegundos.
                  </p>
                </div>

                <div className="rounded-md border border-zinc-900 bg-zinc-950 p-3 space-y-1">
                  <h4 className="font-semibold text-zinc-200">Filtro Notch de Rede (60 Hz / 50 Hz)</h4>
                  <p className="text-zinc-400">
                    Aplica uma atenuacao acentuada com fator Q de 8.0 na frequencia de zumbido de rede eletrica alternada, eliminando a interferencia de fontes de alimentacao sem comprometer o timbre vocal.
                  </p>
                </div>

                <div className="rounded-md border border-zinc-900 bg-zinc-950 p-3 space-y-1">
                  <h4 className="font-semibold text-zinc-200">Volume Master e Limitador Brickwall</h4>
                  <p className="text-zinc-400">
                    Permite elevar o sinal de audio ate 300% do nivel original. Um compressor estrito configurado com razao de 20:1 e threshold de -1.0 dB atua no final da cadeia para barrar picos e prevenir ceifamento digital (clipping).
                  </p>
                </div>
              </div>
            </section>

            <div className="h-px bg-zinc-900" />

            <section id="calibracao-video" className="space-y-3 scroll-mt-6">
              <div className="flex items-center gap-2 text-zinc-400">
                <Eye size={16} />
                <span className="text-[11px] font-mono uppercase tracking-wider">Capitulo 4</span>
              </div>
              <h2 className="text-xl font-bold text-zinc-100">Calibracao Visual e Filtros de Imagem</h2>
              <p>
                Permite corrigir gravacoes escuras, com baixa saturacao ou problemas de contraste atraves de transformacoes aplicadas diretamente no elemento de video:
              </p>
              <ul className="list-disc pl-5 space-y-1 text-zinc-300">
                <li><strong>Brilho:</strong> Intervalo operacional de 50% ate 200%.</li>
                <li><strong>Contraste:</strong> Intervalo operacional de 50% ate 200%.</li>
                <li><strong>Saturacao:</strong> Intensidade cromatica de 0% (preto e branco) ate 300%.</li>
                <li><strong>Escala de Cinza:</strong> Conversao monocromatica de 0% a 100%.</li>
                <li><strong>Tom Sepia:</strong> Filtro visual vintage ajustavel de 0% a 100%.</li>
                <li><strong>Rotacao de Matiz:</strong> Deslocamento angular de cores de 0 a 360 graus.</li>
                <li><strong>Modos de Proporcao:</strong> Conter (original), Preencher Tela, 16:9 forçado e 4:3 forçado.</li>
              </ul>
            </section>

            <div className="h-px bg-zinc-900" />

            <section id="exportacao-video" className="space-y-3 scroll-mt-6">
              <div className="flex items-center gap-2 text-zinc-400">
                <Download size={16} />
                <span className="text-[11px] font-mono uppercase tracking-wider">Exportacao e Download</span>
              </div>
              <h2 className="text-xl font-bold text-zinc-100">Exportacao e Download de Video</h2>
              <p>
                O ClearView Studio possui um pipeline completo de renderizacao em tempo de execucao, executado 100% no navegador (client side) atraves da API Canvas 2D, Web Audio API e MediaRecorder.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1 text-xs">
                <div className="rounded-md border border-zinc-900 bg-zinc-950 p-3 space-y-1">
                  <h4 className="font-semibold text-zinc-200">Filtros de Video Embutidos</h4>
                  <p className="text-zinc-400 text-[11px]">
                    Os filtros aplicados (brilho, contraste, saturacao, sepia, escala de cinza e desfoque) sao rasterizados quadro a quadro no contexto Canvas 2D.
                  </p>
                </div>
                <div className="rounded-md border border-zinc-900 bg-zinc-950 p-3 space-y-1">
                  <h4 className="font-semibold text-zinc-200">Audio DSP Processado</h4>
                  <p className="text-zinc-400 text-[11px]">
                    A trilha sonora exportada deriva da saida do no limitador brickwall do Web Audio, preservando todas as equalizacoes, supressao de ruido e controle de volume.
                  </p>
                </div>
                <div className="rounded-md border border-zinc-900 bg-zinc-950 p-3 space-y-1">
                  <h4 className="font-semibold text-zinc-200">Legendas Gravadas no Quadro</h4>
                  <p className="text-zinc-400 text-[11px]">
                    Legendas estilizadas com fundo solido, translucido ou sombreado sao desenhadas diretamente nos quadros correspondentes da gravacao.
                  </p>
                </div>
              </div>
            </section>

            <div className="h-px bg-zinc-900" />

            <section id="inteligencia-artificial" className="space-y-3 scroll-mt-6">
              <div className="flex items-center gap-2 text-zinc-400">
                <Sparkles size={16} />
                <span className="text-[11px] font-mono uppercase tracking-wider">Capitulo 5</span>
              </div>
              <h2 className="text-xl font-bold text-zinc-100">Inteligencia Artificial e Legendas</h2>
              <p>
                O sistema se comunica com as APIs autenticadas dos seguintes provedores:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-zinc-300">
                <li><strong>Groq:</strong> Modelo Whisper Large v3 Turbo para geracao de legendas com alta velocidade.</li>
                <li><strong>Google Gemini:</strong> Modelo Gemini 3.8 Flash para transcricao, capitulos, resumos e chat contextual.</li>
                <li><strong>OpenAI:</strong> Modelo Whisper-1 para transcricao de audio.</li>
              </ul>

              <h4 className="font-semibold text-zinc-200 pt-2">Recursos Disponiveis na Aba IA:</h4>
              <ul className="list-disc pl-5 space-y-1 text-zinc-400">
                <li><strong>Capitulos Automaticos:</strong> A IA analisa o conteudo e marca mudancas tematicas na timeline do video.</li>
                <li><strong>Resumo Executivo:</strong> Visao sintetizada em topicos com as principais conclusoes do video.</li>
                <li><strong>Pergunte ao Video:</strong> Interface de chat que responde duvidas e fornece atalhos temporais para o minuto exato da fala.</li>
                <li><strong>Traducao de Legendas:</strong> Traduz o texto para Ingles, Espanhol, Frances, Alemao ou Portugues preservando as marcas de tempo.</li>
              </ul>
            </section>

            <div className="h-px bg-zinc-900" />

            <section id="ferramentas-estudo" className="space-y-3 scroll-mt-6">
              <div className="flex items-center gap-2 text-zinc-400">
                <Sliders size={16} />
                <span className="text-[11px] font-mono uppercase tracking-wider">Capitulo 6</span>
              </div>
              <h2 className="text-xl font-bold text-zinc-100">Ferramentas de Estudo e Analise</h2>
              <ul className="list-disc pl-5 space-y-2 text-zinc-300">
                <li>
                  <strong>Zoom e Pan (Lupa Interativa):</strong> Permite aproximar ate 400% e arrastar a imagem com o cursor do mouse para visualizar codigos-fonte, tabelas ou graficos de tamanho reduzido no video.
                </li>
                <li>
                  <strong>Loop A-B:</strong> Defina o ponto A de inicio e o ponto B de termino para criar um ciclo de repeticao continuo. Util para estudo de linguas e partituras musicais.
                </li>
                <li>
                  <strong>Navegacao Quadro a Quadro:</strong> Permite inspecionar a acao do video em passos de 1/30 de segundo atraves das teclas virgula (,) e ponto (.).
                </li>
                <li>
                  <strong>Marcadores e Anotacoes:</strong> Pressione a tecla B para fixar um marcador e adicione notas de texto na aba Notas. As notas podem ser baixadas em arquivo Markdown (.md).
                </li>
                <li>
                  <strong>Captura de Quadro em PNG:</strong> Salva a imagem exata do segundo atual na resolucao original da midia, com os filtros de calibracao aplicados.
                </li>
                <li>
                  <strong>Retomada de Reproducao:</strong> O player armazena no navegador a minutagem de onde o usuario parou, oferecendo um botao para continuar na proxima abertura do video.
                </li>
              </ul>
            </section>

            <div className="h-px bg-zinc-900" />

            <section id="atalhos-teclado" className="space-y-4 scroll-mt-6">
              <div className="flex items-center gap-2 text-zinc-400">
                <Keyboard size={16} />
                <span className="text-[11px] font-mono uppercase tracking-wider">Capitulo 7</span>
              </div>
              <h2 className="text-xl font-bold text-zinc-100">Tabela de Atalhos de Teclado</h2>
              <div className="overflow-hidden rounded-md border border-zinc-900">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-zinc-900 bg-zinc-900/50 text-zinc-400 font-medium">
                      <th className="py-2.5 px-4">Comando / Tecla</th>
                      <th className="py-2.5 px-4">Acao Executada</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-900 font-mono text-[11px]">
                    <tr>
                      <td className="py-2 px-4 text-zinc-200">Espaco ou K</td>
                      <td className="py-2 px-4 font-sans text-zinc-400">Alternar reproduzir e pausar</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-4 text-zinc-200">J ou Seta Esquerda</td>
                      <td className="py-2 px-4 font-sans text-zinc-400">Retroceder 10 segundos na timeline</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-4 text-zinc-200">L ou Seta Direita</td>
                      <td className="py-2 px-4 font-sans text-zinc-400">Avancar 10 segundos na timeline</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-4 text-zinc-200">Virgula (,)</td>
                      <td className="py-2 px-4 font-sans text-zinc-400">Recuar 1 quadro (1/30 de segundo)</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-4 text-zinc-200">Ponto (.)</td>
                      <td className="py-2 px-4 font-sans text-zinc-400">Avancar 1 quadro (1/30 de segundo)</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-4 text-zinc-200">Abre Colchetes ([)</td>
                      <td className="py-2 px-4 font-sans text-zinc-400">Reduzir velocidade de reproducao (-0.25x)</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-4 text-zinc-200">Fecha Colchetes (])</td>
                      <td className="py-2 px-4 font-sans text-zinc-400">Aumentar velocidade de reproducao (+0.25x)</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-4 text-zinc-200">M</td>
                      <td className="py-2 px-4 font-sans text-zinc-400">Alternar ativacao de mudo</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-4 text-zinc-200">F</td>
                      <td className="py-2 px-4 font-sans text-zinc-400">Alternar tela cheia</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-4 text-zinc-200">C</td>
                      <td className="py-2 px-4 font-sans text-zinc-400">Alternar exibicao de legendas</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-4 text-zinc-200">B</td>
                      <td className="py-2 px-4 font-sans text-zinc-400">Criar marcador com nota na posicao atual</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-4 text-zinc-200">S</td>
                      <td className="py-2 px-4 font-sans text-zinc-400">Capturar screenshot do quadro em PNG</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-4 text-zinc-200">P</td>
                      <td className="py-2 px-4 font-sans text-zinc-400">Alternar modo Picture-in-Picture</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            <div className="h-px bg-zinc-900" />

            <section id="arquitetura-tecnica" className="space-y-3 scroll-mt-6">
              <div className="flex items-center gap-2 text-zinc-400">
                <Cpu size={16} />
                <span className="text-[11px] font-mono uppercase tracking-wider">Capitulo 8</span>
              </div>
              <h2 className="text-xl font-bold text-zinc-100">Grafo Web Audio e Ciclo de Processamento</h2>
              <p>
                A conexao do sinal segue a cadeia abaixo, garantindo estabilidade e impedindo distorcao harmonica:
              </p>
              <div className="rounded-md border border-zinc-900 bg-zinc-900/50 p-3 font-mono text-[11px] text-zinc-300 leading-relaxed">
                VideoElement -&gt; MediaElementSource -&gt; ChannelSplitter -&gt; MatrixNodes (LL, LR, RL, RR) -&gt; ChannelMerger -&gt; HighPass (Corte Graves) -&gt; Notch (60Hz) -&gt; LowPass (De-Hiss) -&gt; 5-Band EQ (60Hz a 12kHz) -&gt; SpeechPeaking (Inteligibilidade) -&gt; Compressor -&gt; AnalyserNode -&gt; NoiseGateGain -&gt; MasterGain -&gt; BrickwallLimiter -&gt; AudioDestination
              </div>
            </section>

            <div className="h-px bg-zinc-900" />

            <section id="seguranca" className="space-y-3 scroll-mt-6">
              <div className="flex items-center gap-2 text-zinc-400">
                <Lock size={16} />
                <span className="text-[11px] font-mono uppercase tracking-wider">Capitulo 9</span>
              </div>
              <h2 className="text-xl font-bold text-zinc-100">Privacidade e Armazenamento Local</h2>
              <p>
                Todas as chaves de API, configuracoes de volume, notas e historico de reproducao permanecem armazenadas exclusivamente no localStorage do navegador do proprio usuario. Nenhuma informacao de audio, video ou credenciais e enviada para servidores intermediarios.
              </p>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}
