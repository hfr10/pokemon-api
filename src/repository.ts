import { pool } from "./db";
import { Attack } from "./models/Attack";
import { Pokemon } from "./models/Pokemon";
import { Trainer } from "./models/Trainer";

export async function loadPokemon(id: number): Promise<Pokemon> {
  const { rows } = await pool.query("SELECT * FROM pokemons WHERE id = $1", [id]);
  if (!rows[0]) throw new Error("Pokémon introuvable");
  const pokemon = new Pokemon(rows[0].id, rows[0].name, rows[0].max_life_point, rows[0].life_point);
  const attacks = await pool.query(
    `SELECT a.*, pa.usage_count FROM attacks a
     JOIN pokemon_attacks pa ON pa.attack_id = a.id
     WHERE pa.pokemon_id = $1 ORDER BY a.id`,
    [id]
  );
  pokemon.attacks = attacks.rows.map((a) => new Attack(a.id, a.name, a.damage, a.usage_limit, a.usage_count));
  return pokemon;
}

export async function loadTrainer(id: number): Promise<Trainer> {
  const { rows } = await pool.query("SELECT * FROM trainers WHERE id = $1", [id]);
  if (!rows[0]) throw new Error("Dresseur introuvable");
  const trainer = new Trainer(rows[0].id, rows[0].name, rows[0].level, rows[0].experience);
  const pokemons = await pool.query("SELECT id FROM pokemons WHERE trainer_id = $1 ORDER BY id", [id]);
  for (const p of pokemons.rows) trainer.addPokemon(await loadPokemon(p.id));
  return trainer;
}

export async function loadAttack(id: number): Promise<Attack> {
  const { rows } = await pool.query("SELECT * FROM attacks WHERE id = $1", [id]);
  if (!rows[0]) throw new Error("Attaque introuvable");
  return new Attack(rows[0].id, rows[0].name, rows[0].damage, rows[0].usage_limit);
}

export async function savePokemon(pokemon: Pokemon): Promise<void> {
  await pool.query("UPDATE pokemons SET life_point = $1 WHERE id = $2", [pokemon.lifePoint, pokemon.id]);
  for (const a of pokemon.attacks) {
    await pool.query(
      `INSERT INTO pokemon_attacks (pokemon_id, attack_id, usage_count) VALUES ($1, $2, $3)
       ON CONFLICT (pokemon_id, attack_id) DO UPDATE SET usage_count = $3`,
      [pokemon.id, a.id, a.usageCount]
    );
  }
}

export async function saveTrainer(trainer: Trainer): Promise<void> {
  await pool.query("UPDATE trainers SET level = $1, experience = $2 WHERE id = $3", [
    trainer.level,
    trainer.experience,
    trainer.id,
  ]);
  for (const p of trainer.pokemons) await savePokemon(p);
}
