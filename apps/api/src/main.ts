import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { ValidationPipe } from "@nestjs/common";
import type { Request, Response, NextFunction } from "express";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: "https://studio.apollographql.com",
    credentials: true,
  });

  app.setGlobalPrefix("api");

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  app.use((req: Request, res: Response, next: NextFunction) => {
    const startedAt = Date.now();

    res.on("finish", () => {
      const durationMs = Date.now() - startedAt;

      console.log(
        `${req.method} ${req.originalUrl} ${res.statusCode} ${durationMs}ms`,
      );
    });

    next();
  });

  const port = process.env.INTERNAL_PORT ?? 3015;

  await app.listen(port);

  console.log(`Server is running on port ${port}`);
}

bootstrap();
