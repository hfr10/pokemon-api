import { Pokemon } from "./Pokemon";

export class Trainer {
  pokemons: Pokemon[] = [];

  constructor(
    public id: number,
    public name: string,
    public level = 1,
    public experience = 0
  ) {}

  addPokemon(pokemon: Pokemon): void {
    this.pokemons.push(pokemon);
  }

  healAtTavern(): void {
    this.pokemons.forEach((p) => p.heal());
  }

  gainExperience(amount = 1): void {
    this.experience += amount;
    while (this.experience >= 10) {
      this.experience -= 10;
      this.level++;
    }
  }

  alivePokemons(): Pokemon[] {
    return this.pokemons.filter((p) => !p.isKo());
  }

  randomPokemon(): Pokemon | undefined {
    const alive = this.alivePokemons();
    return alive[Math.floor(Math.random() * alive.length)];
  }

  strongestPokemon(): Pokemon | undefined {
    return this.alivePokemons().sort((a, b) => b.lifePoint - a.lifePoint)[0];
  }
}
