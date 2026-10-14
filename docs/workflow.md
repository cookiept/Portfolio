# Trabalhar nos dois PCs

O GitHub é a "fonte de verdade". Cada PC tem uma cópia (clone) do projeto.
Sincronizas com `git pull` (trazer) e `git push` (enviar).

## Configuração inicial (uma vez em cada PC)

```bash
git config --global user.name "Gonçalo"
git config --global user.email "o-teu-email@exemplo.com"

git clone https://github.com/cookiept/Portfolio.git
cd Portfolio
npm install
```

Depois abre a pasta `Portfolio` no Antigravity.

## Rotina diária

**Ao começar** (sempre, antes de mexer em qualquer coisa):

```bash
git pull
npm install   # só se o package.json mudou
```

**Ao terminar** (antes de sair do PC):

```bash
git add -A
git commit -m "Descrição curta do que fizeste"
git push
```

Regra de ouro: **pull ao começar, push ao terminar.** Assim os dois PCs nunca divergem.

No Antigravity também podes fazer isto pelo painel Source Control (ícone de ramos):
botão de sincronizar = pull + push.

## Voltar atrás

Cada commit é um ponto de restauro. No fim de cada fase marca-se uma tag:

```bash
git tag fase-1-setup
git push --tags
```

Ver o histórico:

```bash
git log --oneline
```

Desfazer alterações ainda não guardadas (cuidado: perdes o que não fizeste commit):

```bash
git restore .
```

Desfazer um commit já enviado, sem apagar histórico (seguro):

```bash
git revert <id-do-commit>
git push
```

Experimentar algo arriscado sem estragar o principal:

```bash
git switch -c experiencia-nova    # cria um ramo
# ... trabalhas, fazes commits ...
git push -u origin experiencia-nova
# Se correu bem: junta ao main (pull request no GitHub). Se correu mal: abandona o ramo.
```

## Se der conflito

Acontece se mexeste no mesmo ficheiro nos dois PCs sem sincronizar.
O Git marca as zonas com `<<<<<<<` e `>>>>>>>`. Escolhe a versão certa, apaga as marcas,
e depois `git add -A && git commit && git push`. Ou pede ajuda ao Claude.
