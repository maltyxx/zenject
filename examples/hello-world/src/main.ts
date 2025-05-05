import { Zenject } from "@zenject/core";
import { AppModule } from "./app.module";
import { AppService } from "./app.service";

const app = new Zenject(AppModule);
await app.bootstrap(() => {
  app.resolve(AppService).helloWorld();
});
