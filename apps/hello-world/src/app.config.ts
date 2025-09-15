import { createConfig } from "@zenject/config";
import { z } from "zod";

export const appConfig = createConfig("app", {
  schema: z.object({
    environment: z
      .enum(["development", "staging", "production"])
      .default("development"),
  }),
  description: "Main configuration for Hello World application",
});
