import { app } from "./app.js";
import { connectDatabase } from "./config/database.js";
import { env } from "./config/env.js";

try {
  await connectDatabase();
  const server = app.listen(env.PORT, () => {
    console.info(`URL shortener API listening on port ${env.PORT}`);
  });

  for (const signal of ["SIGINT", "SIGTERM"]) {
    process.on(signal, () => {
      server.close(async () => {
        const mongoose = await import("mongoose");
        await mongoose.default.disconnect();
        process.exit(0);
      });
    });
  }
} catch (error) {
  console.error("Failed to start the API:", error);
  process.exit(1);
}
