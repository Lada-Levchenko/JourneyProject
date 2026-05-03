import { NestFactory } from "@nestjs/core";
import { PaymentsModule } from "./payments.module";
import { Transport, MicroserviceOptions } from "@nestjs/microservices";
import { join } from "path";

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    PaymentsModule,
    {
      transport: Transport.GRPC,
      options: {
        package: "payments",
        protoPath: join(process.cwd(), "packages/contracts/payments.proto"),
        url: "0.0.0.0:50051",
      },
    },
  );

  await app.listen();

  const shutdown = async (signal: string) => {
    console.log(`Received ${signal}, shutting down gracefully...`);
    await app.close();
    process.exit(0);
  };

  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));
}
bootstrap().catch((error) => {
  console.error("Failed to start payments microservice", error);
  process.exit(1);
});
