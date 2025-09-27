# Руководство по деплою проекта `pdf-e-sign` на GitHub Pages

Ниже пошагово описан полный цикл подготовки проекта, сборки и публикации на GitHub Pages, с фиксами, которые понадобились в процессе.

## Предусловия

- Установлены Node.js и npm (в примере использовалась глобальная установка Node 20/22; в WSL1 возможны предупреждения, но команды выполняются).
- Установлен Git и GitHub CLI (`gh`) с настроенной SSH-авторизацией для GitHub.
- Работа ведётся в каталоге проекта `pdf-e-sign`.

## 1. Осмотр состояния проекта

```bash
ls -a
cat package.json
cat angular.json
```

Это позволяет увидеть структуру и текущие настройки сборки.

## 2. Настройка Angular под GitHub Pages

### 2.1. Прописываем `baseHref`

В файле `angular.json` в конфигурации `production` добавляем строку:

```json
"baseHref": "/pdf-e-sign/"
```

Это гарантирует, что относительные пути к ассетам будут корректными на Pages.

### 2.2. Добавляем `.gitignore`

Создаём `.gitignore` с типовым набором исключений (Node modules, сборки, IDE файлы и т.д.).

```bash
cat <<'GITIGNORE' > .gitignore
# Node dependencies
node_modules/

# Angular build output
/dist/

# Logs
npm-debug.log*
yarn-debug.log*

# Environment files
.env
.env.*
.env.local

# IDE/editor
.vscode/
.idea/

# Misc
.DS_Store
Thumbs.db

# Temporary
/tmp/
GITIGNORE
```

### 2.3. Создаём workflow для деплоя

1. Создаём каталог `.github/workflows`.
2. Добавляем файл `deploy.yml` со следующим содержимым:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: true

jobs:
  build-deploy:
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build Angular app
        run: npm run build -- --configuration production --base-href /pdf-e-sign/

      - name: Setup Pages
        uses: actions/configure-pages@v5

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: dist/pdf-signer/browser

      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

Важно: деплоим именно содержимое `dist/pdf-signer/browser`, потому что Angular 18+ пишет HTML внутрь подпапки `browser`.

## 3. Починка зависимостей и генерация `package-lock.json`

Проект шёл с конфликтующими версиями Angular toolchain и TypeScript. Исправления делались так:

1. Удалены пакеты `@angular/build`, `@angular/cli`, `@angular/compiler-cli` из `dependencies`.
2. Те же пакеты и `@angular-devkit/build-angular` перенесены/обновлены в `devDependencies`.
3. Версия TypeScript повышена до `~5.8.2`.

Актуальный блок `devDependencies`:

```json
"devDependencies": {
  "@angular-devkit/build-angular": "^20.3.3",
  "@angular/cli": "^20.3.3",
  "@angular/compiler-cli": "^20.3.0",
  "typescript": "~5.8.2"
}
```

После правок сгенерирован `package-lock.json` без установки модулей (так быстрее и надёжнее в ограниченных окружениях):

```bash
npm install --package-lock-only --ignore-scripts
```

Эта команда фиксирует зависимости для `npm ci`, но не кладёт `node_modules` в проект.

## 4. Инициализация Git и первый коммит

```bash
git init
git status -sb
git add .
git commit -m "Initial commit"
```

## 5. Создание удалённого репозитория и первый push

Через GitHub CLI создаём репозиторий и настраиваем origin:

```bash
gh repo create pdf-e-sign --public --project "PDF e-sign" # --confirm больше не нужен

# Прописываем origin (SSH)
git remote add origin git@github.com:prorokusa/pdf-e-sign.git

# Загружаем основной коммит
git push -u origin main
```

После первого пуша workflow стартует, но падает, т.к. не хватает шага `configure-pages` и путь артефакта указывает на `dist/pdf-signer`. Эти два момента исправлялись далее.

## 6. Чиним GitHub Actions

1. Добавлен шаг `actions/configure-pages@v5` (см. актуальный YAML выше).
2. Путь артефакта изменён на `dist/pdf-signer/browser`.

Каждое изменение коммитится и пушится:

```bash
git add .github/workflows/deploy.yml
git commit -m "Fix GitHub Pages workflow"
git push

# затем

git commit -am "Fix Pages artifact path"
git push
```

После этих фиксов GitHub Pages успешно разворачивает билд.

## 7. UI-фиксы после деплоя

Пока тестировалось приложение, нашлись две проблемы с позиционированием подписи.

### 7.1. Подпись «сползала» из-за контейнера

Добавлен стиль для `#pdf-viewer`, чтобы подписи позиционировались относительно правильного контейнера:

```css
#pdf-viewer {
  position: relative;
  display: inline-block;
}
```

Команда фикса:

```bash
git add src/styles.css
git commit -m "Fix signature placement offset"
git push
```

### 7.2. Подпись появлялась ниже клика

В обработчике клика убрано добавление `scrollTop/scrollLeft`. Теперь координаты берутся напрямую из `getBoundingClientRect()`:

```ts
const rect = viewer.getBoundingClientRect();
const finalX = event.clientX - rect.left;
const finalY = event.clientY - rect.top;

this.placedSignatures.update(sigs => [...sigs, {
  ...,
  position: {
    x: finalX - defaultWidth / 2,
    y: finalY - defaultHeight / 2,
  },
}]);
```

Команды для фикса:

```bash
git add src/app.component.ts
git commit -m "Align signature placement with click"
git push
```

Каждый пуш автоматически триггерит workflow, и после успешного завершения сайт обновляется.

## 8. Проверка GitHub Pages

Проверяем статус страниц и Actions:

```bash
gh api repos/prorokusa/pdf-e-sign/pages
gh run list --limit 5
```

После зелёного прогона открываем сайт:

```
https://prorokusa.github.io/pdf-e-sign/
```

Если виден кэш предыдущей версии — открыть в режиме инкогнито либо сбросить кэш браузера.

---

Эти шаги дают полный процесс от исходного состояния проекта до работающего деплоя на GitHub Pages с рабочим UI размещения подписи.
