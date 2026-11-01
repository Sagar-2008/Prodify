import "dotenv/config";
import { app } from "./app.js";
import { testDbConnection } from "./config/db.js";

const PORT = process.env.PORT || 5000;

app.listen(PORT, async () => {
  console.log(`🚀 Backend running on port ${PORT}`);
  await testDbConnection();
});
