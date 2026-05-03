# CI/CD Pipeline

У проєкті реалізовано CI/CD pipeline через **GitHub Actions**:

- `pr-checks.yml` — перевірки для Pull Request
- `build-and-stage.yml` — build Docker images, push у GHCR, автоматичний deploy у stage
- `deploy-prod.yml` — ручний deploy у production

## PR Checks

Workflow запускається для PR у `develop` та `main` і виконує:

- `npm ci`
- lint
- тести
- build/Docker validation

## Build and Stage

Після push у `develop` workflow:

- збирає Docker images
- пушить їх у **GHCR**
- використовує immutable tag у форматі `sha-<commit_sha>`
- створює `release-manifest.json`
- автоматично деплоїть stage

Stage deploy виконується на **Remote VM + Docker Compose**:

1. піднімається інфраструктура (`postgres`, `rabbitmq`, `minio`)
2. запускаються міграції
3. запускаються application-сервіси (`api`, `worker`, `payments`)
4. виконується smoke test

Stage середовище доступне за адресою:  
**http://178.104.207.183:3015**

## Production Deploy

Production deploy винесений в окремий workflow `deploy-prod.yml`.

Він:

- запускається **вручну** через GitHub UI
- використовує **той самий image tag**, що був зібраний раніше
- не виконує повторний build
- працює через GitHub Environment `production`
- підтримує **manual approval**
- захищений від паралельних deploy через `concurrency`

Production середовище доступне за адресою:  
**http://178.104.207.183:4015**

## Artifact

Для stage і production використовується той самий immutable artifact:

- Docker image з tag `sha-<commit_sha>`

Це гарантує, що production deploy використовує вже перевірений image без rebuild.

## Deploy target

Для deploy використовується **Remote VM + Docker Compose**.

Stage і production розгортаються в різні директорії на сервері, наприклад:

- `/opt/journeyproject-stage`
- `/opt/journeyproject-prod`

```

```
