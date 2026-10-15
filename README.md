# Portfolio

Website pessoal do Gonçalo: quem sou, o que faço e alguns projetos.
Feito com [Astro](https://astro.build) (site estático, rápido e sem servidor).

## Começar

Precisas de [Node.js 22+](https://nodejs.org) e [Git](https://git-scm.com).

```bash
npm install      # instala dependências (uma vez por PC, e quando o package.json mudar)
npm run dev      # abre o site em http://localhost:4321
npm run build    # gera o site final em dist/
```

## Estrutura

```
.
├── public/                    Ficheiros servidos tal como estão (favicon, robots.txt, cv.pdf…)
├── src/
│   ├── assets/projects/       Imagens de capa dos projetos (otimizadas pelo Astro)
│   ├── components/
│   │   ├── effects/           Efeitos interativos em React
│   │   │   ├── DappledLight/  Fundo do hero (luz da janela com folhas)
│   │   │   ├── LiquidChrome/  Fundo líquido antigo (já não é usado)
│   │   │   └── Specular/      Brilho na borda (botão e card) + hook partilhado
│   │   ├── mascot/            Buddy, a mascote
│   │   ├── sections/          Secções da landing page (Hero, Work, Contact)
│   │   └── ui/                Peças pequenas (Nav, Footer, ProjectCard)
│   ├── content/projects/      Um ficheiro Markdown por projeto
│   ├── data/                  Dados gerais do site (nome, links)
│   ├── layouts/               Estrutura base das páginas (<head>, SEO)
│   ├── pages/                 Páginas: index, 404, projects/[slug]
│   ├── scripts/               JavaScript da página (mascote, animações de scroll)
│   ├── styles/                tokens.css (style guide) e global.css
│   └── utils/                 Funções auxiliares
├── docs/                      Notas do projeto
└── .github/                   Build e publicação automática
```

### Adicionar a imagem de um projeto

1. Coloca a imagem em `src/assets/projects/` (ex.: `petsight.jpg`).
2. No ficheiro do projeto em `src/content/projects/`, acrescenta `cover: ../../assets/projects/petsight.jpg`.

## Site online

Publicado automaticamente em https://cookiept.github.io/Portfolio/ a cada push para o `main`.

## Trabalhar nos dois PCs

Ver [docs/workflow.md](docs/workflow.md).

## Segurança

- Nunca fazer commit de `.env`, passwords, tokens ou chaves. Usa `.env.example` como modelo.
- Variáveis `PUBLIC_*` ficam visíveis no site publicado: nada de segredos aí.
- Sem scripts de terceiros sem necessidade (analytics, widgets).
- Dados pessoais: só o que queres mesmo público (evita morada e telefone pessoal).
- O Dependabot avisa quando há dependências desatualizadas ou vulneráveis.
