import "express-async-errors";
import express from "express";
import cors from "cors";
import { logger } from "./middleware/logger";
import { router as teams } from "./routes/teams";
import { router as votesRouter } from "./routes/votes";

const app = express();
app.use(cors());
app.use(express.json());
app.use(logger);

app.use("/api/teams", teams);
app.use("/api/votes", votesRouter);

const PORT = 8080;
app.listen(PORT, () => console.log(`Listening on ${PORT}...`));

const votes: Record<string, number> = {};

app.post("/api/votes/:playerId", (req, res) => {
  const playerId = req.params.playerId;
  const userId = req.body.userId;


  if (votes[`${userId}_${playerId}`]) {
    return res.status(400).json({ error: "You have already voted for this player." });
  }

  if (!votes[playerId]) {
    votes[playerId] = 1;
  } else {
    votes[playerId]++;
  }

  return res.sendStatus(204);
});