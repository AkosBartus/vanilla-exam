import express from "express";
import { z } from "zod";
import fs from "fs/promises";

const router = express.Router();

const VoteRequestSchema = z.object({
  userId: z.string(),
  playerId: z.number(),
});

const VOTES_FILE_PATH = 'database/votes.json';

interface Vote {
  userId: string;
  playerId: number;
}

let votes: Vote[] = [];

async function loadVotesFromFile() {
  try {
    const data = await fs.readFile(VOTES_FILE_PATH, "utf-8");
    votes = JSON.parse(data);
  } catch (error) {
    console.error("Error loading votes from file:", error);
  }
}

async function saveVotesToFile() {
  try {
    await fs.writeFile(VOTES_FILE_PATH, JSON.stringify(votes, null, 2));
  } catch (error) {
    console.error("Error saving votes to file:", error);
  }
}

loadVotesFromFile();

router.post("/:playerId", async (req, res) => {
  const paramsParseResult = VoteRequestSchema.safeParse({
    userId: req.body.userId,
    playerId: parseInt(req.params.playerId), 
  });

  if (!paramsParseResult.success)
    return res.sendStatus(400);

  const { userId, playerId } = paramsParseResult.data;

  const existingVoteIndex = votes.findIndex((vote) => vote.userId === userId && vote.playerId === playerId);

  if (existingVoteIndex !== -1) {
    votes[existingVoteIndex] = { userId, playerId };
  } else {
    votes.push({ userId, playerId });
  }

  await saveVotesToFile();

  return res.sendStatus(204);
});

export { router };
