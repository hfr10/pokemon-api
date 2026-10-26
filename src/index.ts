import express, { NextFunction, Request, Response } from "express";
import fs from "fs";
import { arena1, arena2, deterministicChallenge, randomChallenge } from "./battle";
import { pool } from "./db";
import { loadAttack, loadPokemon, loadTrainer, savePokemon, saveTrainer } from "./repository";

const app = express();
app.use(express.json());

app.get("/trainers", async (req, res) => {
  const { rows } = await pool.query("SELECT * FROM trainers ORDER BY id");
  res.json(rows);
});

app.post("/trainers", async (req, res) => {
  const { rows } = await pool.query("INSERT INTO trainers (name) VALUES ($1) RETURNING id", [req.body.name]);
  res.status(201).json(await loadTrainer(rows[0].id));
});

app.get("/trainers/:id", async (req, res) => {
  res.json(await loadTrainer(Number(req.params.id)));
});

app.post("/trainers/:id/pokemons", async (req, res) => {
  const trainer = await loadTrainer(Number(req.params.id));
  await pool.query(
    "INSERT INTO pokemons (trainer_id, name, life_point, max_life_point) VALUES ($1, $2, $3, $3)",
    [trainer.id, req.body.name, req.body.lifePoint]
  );
  res.status(201).json(await loadTrainer(trainer.id));
});

app.post("/trainers/:id/tavern", async (req, res) => {
  const trainer = await loadTrainer(Number(req.params.id));
  trainer.healAtTavern();
  await saveTrainer(trainer);
  res.json(trainer);
});

app.get("/attacks", async (req, res) => {
  const { rows } = await pool.query("SELECT id FROM attacks ORDER BY id");
  const attacks = await Promise.all(rows.map((r) => loadAttack(r.id)));
  res.json(attacks.map((a) => ({ ...a, info: a.toString() })));
});

app.post("/attacks", async (req, res) => {
  const { name, damage, usageLimit } = req.body;
  const { rows } = await pool.query(
    "INSERT INTO attacks (name, damage, usage_limit) VALUES ($1, $2, $3) RETURNING id",
    [name, damage, usageLimit]
  );
  res.status(201).json(await loadAttack(rows[0].id));
});

app.post("/pokemons/:id/attacks", async (req, res) => {
  const pokemon = await loadPokemon(Number(req.params.id));
  pokemon.learnAttack(await loadAttack(Number(req.body.attackId)));
  await savePokemon(pokemon);
  res.json(pokemon);
});

app.post("/pokemons/:id/heal", async (req, res) => {
  const pokemon = await loadPokemon(Number(req.params.id));
  pokemon.heal();
  await savePokemon(pokemon);
  res.json(pokemon);
});

app.post("/pokemons/:id/attack/:targetId", async (req, res) => {
  const pokemon = await loadPokemon(Number(req.params.id));
  const target = await loadPokemon(Number(req.params.targetId));
  const attack = pokemon.attack(target);
  if (!attack) throw new Error("Aucune attaque disponible");
  await savePokemon(pokemon);
  await savePokemon(target);
  res.json({ attack: attack.toString(), pokemon, target });
});

const battles = { random: randomChallenge, arena1, deterministic: deterministicChallenge, arena2 };

app.post("/battles/:type", async (req, res) => {
  const battle = battles[req.params.type as keyof typeof battles];
  if (!battle) throw new Error("Type de combat inconnu (random, arena1, deterministic, arena2)");
  const t1 = await loadTrainer(Number(req.body.trainer1Id));
  const t2 = await loadTrainer(Number(req.body.trainer2Id));
  const winner = battle(t1, t2);
  await saveTrainer(t1);
  await saveTrainer(t2);
  res.json({ winner: winner.name, trainers: [t1, t2] });
});

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  res.status(400).json({ error: err.message });
});

pool.query(fs.readFileSync("schema.sql", "utf8")).then(() => {
  app.listen(3000, () => console.log("API sur http://localhost:3000"));
});
