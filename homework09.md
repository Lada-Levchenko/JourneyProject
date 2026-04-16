# homework09.md

## Інтеграція Files / Storage

У цьому завданні з файловим сховищем інтегровано домен Users.

Система використовує **MinIO** та реалізує підхід **presigned upload flow**.

URL для upload і download формуються з окремим, зовнішнім url-endpoint, щоб бекенд міг стукатися до MinIO через docker-network, а користувач - через інтернет.

Для опису типів файлів використовується enum `FileType`.
У поточній реалізації підтримується тип `AVATAR`.

---

## Потік завантаження файлу

### 1. Отримання presigned URL

Клієнт робить запит:

```
POST /api/files/presign

{
"fileType": "avatar",
"contentType": "image/jpeg"
}
```

Бекенд:

- перевіряє доступ користувача
- визначає тип файлу (`FileType`)
- генерує ключ зберігання через helper (`generateKey`)
- створює `FileRecord` у базі даних зі статусом `pending`
- повертає presigned `uploadUrl`

Приклад ключа:

```
users/{userId}/avatars/{uuid}.jpg
```

Приклад відповіді:

```
{
  "fileId": "uuid",
  "key": "users/123/avatars/abc.jpg",
  "uploadUrl": "https://...",
  "contentType": "image/jpeg"
}
```

---

### 2. Завантаження файлу напряму у S3

Клієнт завантажує файл напряму у MinIO/S3 через `PUT uploadUrl`.

Для перевірки:

```powershell
curl -T "<path-to-file>" -X PUT "<uploadURL>" -H "Content-Type: image/jpeg"
```

Файл потрапляє у storage, але в системі ще має статус pending.

---

### 3. Підтвердження завантаження

Клієнт викликає:

```
POST /api/files/complete

{
	"fileId": "uuid"
}
```

Приклад відповіді:

```json
{
  "fileId": "uuid",
  "status": "ready"
}
```

Бекенд:

- перевіряє ownership файлу
- перевіряє наявність файлу у S3
- змінює статус `pending → ready`
- прив’язує файл до доменної сутності

У цьому завданні файл прив’язується до користувача:

```
User.avatarFileId
```

---

## Контроль доступу

- Ключ (`key`) генерується виключно на бекенді
- Користувач не може завантажувати файли у довільні префікси
- Під час завершення завантаження перевіряється ownership

```
file.ownerId === currentUser.id
```

Це гарантує, що користувач не може завершити або використати файл, який належить іншому користувачу.

---

## File delivery

Для публічних файлів повертається прямий URL. URL для перегляду файлу формується за схемою:

```
S3_ENDPOINT + bucket + key
```

Приклад:

```
http://localhost:9000/<bucket>/users/{userId}/avatars/{uuid}.jpg
```

У production-середовищі цей URL може бути замінений на CDN:

```
CLOUDFRONT_BASE_URL + key
```

Для приватних файлів генерується signed download URL, який генерується бекендом через S3 SDK і діє обмежений час.

Задля виконання вимог завдання я використовую signed download підхід для аватарів користувачів.

Запит на отримання URL файлу:

```
GET /api/files/{fileId}
```

Приклад відповіді:

```json
{
  "id": "uuid",
  "key": "users/{userId}/avatars/{uuid}.jpg",
  "url": "<presignedUrl>",
  "contentType": "image/jpeg",
  "size": 0
}
```
