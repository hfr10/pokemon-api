import { Pokemon } from "./models/Pokemon";
import { Trainer } from "./models/Trainer";

function fight(p1: Pokemon, p2: Pokemon): Pokemon {
  let [attacker, defender] = [p1, p2];
  while (!p1.isKo() && !p2.isKo()) {
    if (!attacker.canAttack() && !defender.canAttack()) break;
    attacker.attack(defender);
    [attacker, defender] = [defender, attacker];
  }
  return p1.lifePoint >= p2.lifePoint ? p1 : p2;
}

function duel(t1: Trainer, t2: Trainer, p1?: Pokemon, p2?: Pokemon): Trainer {
  if (!p1 || !p2) throw new Error("Chaque dresseur doit avoir un Pokémon en état de combattre");
  const winner = fight(p1, p2) === p1 ? t1 : t2;
  winner.gainExperience();
  return winner;
}

function best(t1: Trainer, t2: Trainer): Trainer {
  if (t1.level !== t2.level) return t1.level > t2.level ? t1 : t2;
  return t1.experience >= t2.experience ? t1 : t2;
}

export function randomChallenge(t1: Trainer, t2: Trainer): Trainer {
  t1.healAtTavern();
  t2.healAtTavern();
  return duel(t1, t2, t1.randomPokemon(), t2.randomPokemon());
}

export function arena1(t1: Trainer, t2: Trainer): Trainer {
  for (let i = 0; i < 100; i++) randomChallenge(t1, t2);
  return best(t1, t2);
}

export function deterministicChallenge(t1: Trainer, t2: Trainer): Trainer {
  return duel(t1, t2, t1.strongestPokemon(), t2.strongestPokemon());
}

export function arena2(t1: Trainer, t2: Trainer): Trainer {
  for (let i = 0; i < 100; i++) {
    if (t1.alivePokemons().length === 0) return t2;
    if (t2.alivePokemons().length === 0) return t1;
    deterministicChallenge(t1, t2);
  }
  return best(t1, t2);
}
