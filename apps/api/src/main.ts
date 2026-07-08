import "reflect-metadata";
import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { apiEnv } from "./config/env";

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    cors: true
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true
    })
  );

  app.enableCors({
    origin: apiEnv.corsOrigin
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean)
  });

  const port = apiEnv.port;
  await app.listen(port);
  console.log(`SceneAtlas API listening on http://localhost:${port}`);
}

void bootstrap();
