# homework10.md

Прошу зауважити, оскільки це монорепо, для запуску потрібно два env-файли:
  - `.env` (є відповідний шаблон `.env.example`)
  - `apps/api/.env.production` (є відповідний шаблон `apps/api/.env.production.example`)

Змінні в них не дублюються. `.env` використовується для compose, і деякі змінні з нього прокидуються далі в контейнери.

## 1 Команди запуску

### Development

Запуск API у режимі розробки з hot reload:

```bash
docker compose -f compose.yml -f compose.dev.yml up -d --build
```

### Production-like

```bash
docker compose -f compose.yml up -d --build
```

### Distroless profile

```bash
docker compose --profile distroless up -d --build
```

### Міграції та seed

Через profile:

```bash
docker compose --profile tools up --build
```

або:

```bash
docker compose run --rm migrate
docker compose run --rm seed
```

## 2 Докази оптимізації

### `docker image ls`

```powershell
REPOSITORY                      TAG       IMAGE ID       CREATED             SIZE
journeyproject-api              latest    badb1e6d2a87   21 minutes ago      306MB
journeyproject-api-distroless   latest    cf7a79c70c7a   About an hour ago   295MB
```

### `docker history <image>`

```powershell
> docker history journeyproject-api
IMAGE          CREATED          CREATED BY                                      SIZE      COMMENT
badb1e6d2a87   23 minutes ago   CMD ["node" "apps/api/dist/main.js"]            0B        buildkit.dockerfile.v0
<missing>      23 minutes ago   EXPOSE map[3015/tcp:{}]                         0B        buildkit.dockerfile.v0
<missing>      23 minutes ago   USER node                                       0B        buildkit.dockerfile.v0
<missing>      23 minutes ago   COPY /app/apps/api/dist ./apps/api/dist # bu…   190kB     buildkit.dockerfile.v0
<missing>      23 minutes ago   COPY /app/apps/api/package*.json ./apps/api/…   1.62kB    buildkit.dockerfile.v0
<missing>      23 minutes ago   COPY /app/package*.json ./ # buildkit           990kB     buildkit.dockerfile.v0
<missing>      23 minutes ago   COPY /app/node_modules ./node_modules # buil…   142MB     buildkit.dockerfile.v0
<missing>      23 minutes ago   ENV NODE_ENV=production                         0B        buildkit.dockerfile.v0
<missing>      2 days ago       WORKDIR /app                                    0B        buildkit.dockerfile.v0
<missing>      7 days ago       CMD ["node"]                                    0B        buildkit.dockerfile.v0
<missing>      7 days ago       ENTRYPOINT ["docker-entrypoint.sh"]             0B        buildkit.dockerfile.v0
<missing>      7 days ago       COPY docker-entrypoint.sh /usr/local/bin/ # …   388B      buildkit.dockerfile.v0
<missing>      7 days ago       RUN /bin/sh -c apk add --no-cache --virtual …   5.36MB    buildkit.dockerfile.v0
<missing>      7 days ago       ENV YARN_VERSION=1.22.22                        0B        buildkit.dockerfile.v0
<missing>      7 days ago       RUN /bin/sh -c addgroup -g 1000 node     && …   149MB     buildkit.dockerfile.v0
<missing>      7 days ago       ENV NODE_VERSION=22.22.1                        0B        buildkit.dockerfile.v0
<missing>      6 weeks ago      CMD ["/bin/sh"]                                 0B        buildkit.dockerfile.v0
<missing>      6 weeks ago      ADD alpine-minirootfs-3.23.3-x86_64.tar.gz /…   8.44MB    buildkit.dockerfile.v0
```

```powershell
> docker history journeyproject-api-distroless
IMAGE          CREATED             CREATED BY                                      SIZE      COMMENT
cf7a79c70c7a   About an hour ago   CMD ["apps/api/dist/main.js"]                   0B        buildkit.dockerfile.v0
<missing>      About an hour ago   EXPOSE map[3015/tcp:{}]                         0B        buildkit.dockerfile.v0
<missing>      About an hour ago   USER nonroot                                    0B        buildkit.dockerfile.v0
<missing>      About an hour ago   COPY /app/apps/api/dist ./apps/api/dist # bu…   190kB     buildkit.dockerfile.v0
<missing>      3 hours ago         COPY /app/apps/api/package*.json ./apps/api/…   1.62kB    buildkit.dockerfile.v0<missing>      3 hours ago         COPY /app/package*.json ./ # buildkit           990kB     buildkit.dockerfile.v0<missing>      3 hours ago         COPY /app/node_modules ./node_modules # buil…   142MB     buildkit.dockerfile.v0<missing>      3 hours ago         ENV NODE_ENV=production                         0B        buildkit.dockerfile.v0<missing>      3 hours ago         WORKDIR /app                                    0B        buildkit.dockerfile.v0<missing>      N/A                 bazel build @nodejs22_amd64//:data              125MB
<missing>      N/A                 bazel build @trixie//gcc-14-base/amd64:data_…   106kB
<missing>      N/A                 bazel build @trixie//libgcc-s1/amd64:data_st…   184kB
<missing>      N/A                 bazel build @trixie//libstdc++6/amd64:data_s…   2.64MB
<missing>      N/A                 bazel build @trixie//libgomp1/amd64:data_sta…   349kB
<missing>      N/A                 bazel build @trixie//zlib1g/amd64:data_statu…   161kB
<missing>      N/A                 bazel build @trixie//libzstd1/amd64:data_sta…   855kB
<missing>      N/A                 bazel build @trixie//libssl3t64/amd64:data_s…   7.99MB
<missing>      N/A                 bazel build @trixie//libc6/amd64:data_statusd   13MB
<missing>      N/A                 bazel build //common:cacerts_debian13_amd64     243kB
<missing>      N/A                 bazel build //common:os_release_debian13        344B
<missing>      N/A                 bazel build //static:nsswitch                   497B
<missing>      N/A                 bazel build //common:tmp                        0B
<missing>      N/A                 bazel build //common:group                      64B
<missing>      N/A                 bazel build //common:home                       0B
<missing>      N/A                 bazel build //common:passwd                     149B
<missing>      N/A                 bazel build //common:rootfs                     0B
<missing>      N/A                 bazel build @trixie//media-types/amd64:data_…   88.8kB
<missing>      N/A                 bazel build @trixie//tzdata-legacy/amd64:dat…   819kB
<missing>      N/A                 bazel build @trixie//tzdata/amd64:data_statu…   754kB
<missing>      N/A                 bazel build @trixie//netbase/amd64:data_stat…   23.2kB
<missing>      N/A                 bazel build @trixie//base-files/amd64:data_s…   273kB
```

### Висновок

У цьому проєкті різниця між `prod` і `prod-distroless` виявилась невеликою, тому що основну частину розміру обох образів формують production dependencies, які копіюються у вигляді `node_modules` (~142 MB). \

`prod-distroless` все одно менший на декілька МБ, тому що має урізаний базовий образ, який не містить shell, package manager, зайвих утиліт.

Отже, в цьому випадку головна перевага `prod-distroless` — не лише розмір, а й менша поверхня атаки та чистіший runtime.

## 3 Перевірка non-root

Звичайний production image:

```bash
> docker compose exec api id
uid=1000(node) gid=1000(node) groups=1000(node)
```

Результат - користувач uid=1000(node).

Distroless production image:

```bash
> docker compose exec api-distroless id
OCI runtime exec failed: exec failed: unable to start container process: exec: "id": executable file not found in $PATH: unknown
```

Distroless-образи не містять shell та звичних інструментів для інтерактивної перевірки, таких як sh, bash або whoami, тому можливості діагностики всередині контейнера обмежені.

Гарантія запуску не від root забезпечується тим, що використовується distroless runtime base image з non-root підходом, і у Dockerfile явно вказано USER nonroot.
