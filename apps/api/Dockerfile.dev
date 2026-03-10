FROM node:22-alpine

WORKDIR /app


COPY package*.json ./

COPY apps/api ./apps/api
COPY packages ./packages

RUN npm ci --workspace=api

RUN npm i -g @nestjs/cli

RUN npm run build:api

WORKDIR /app/apps/api

EXPOSE 3015

CMD ["npm", "start"]
