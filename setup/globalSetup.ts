import { FullConfig } from "@playwright/test";
import * as dotenv from "dotenv";

async function globalSetup(config: FullConfig) {
  if (process.env.env) {
    dotenv.config({
      path: `.env.${process.env.env}`,
      override: true,
    });
  }
}

export default globalSetup;
