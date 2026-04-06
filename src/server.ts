import express from "express";
import path from "node:path";
import { apiRouter } from "./api/routes.js";

const app = express();
const port = Number(process.env.PORT || 3000);

app.use(express.json({ limit: "1mb" }));
app.use("/api", apiRouter);
app.use(express.static(path.resolve("public")));

app.get("*", (_, res) => {
  res.sendFile(path.resolve("public/index.html"));
});

app.listen(port, () => {
  console.log(`Website Revenue Leak Detector listening on http://localhost:${port}`);
});
