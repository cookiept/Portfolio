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
├── public/               Ficheiros servidos tal como estão (favicon, robots.txt, CV em PDF…)
├── src/
│   ├── assets/images/    Imagens otimizadas pelo Astro (fotos, screenshots de projetos)
│   ├── components/       Componentes reutilizáveis (Header, Footer, Card, Button…)
│   ├── content/projects/ Um ficheiro Markdown por projeto
│   ├── data/             Dados gerais do site (nome, links, redes sociais)
│   ├── layouts/          Estrutura base das páginas (<head>, SEO)
│   ├── pages/            Cada ficheiro é uma página/rota (index → /, 404…)
│   └── styles/           tokens.css (style guide) e global.css
├── docs/                 Notas do projeto (como trabalhar nos dois PCs, decisões)
└── .github/              Verificação automática de build e atualizações de dependências
```

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
