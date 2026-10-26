import { Attack } from "./Attack";

export class Pokemon {
  attacks: Attack[] = [];

  constructor(
    public id: number,
    public name: string,
    public maxLifePoint: number,
    public lifePoint = maxLifePoint
  ) {}

  learnAttack(attack: Attack): void {
    if (this.attacks.length >= 4) throw new Error("Un Pokémon ne peut pas avoir plus de 4 attaques");
    if (this.attacks.some((a) => a.id === attack.id)) throw new Error("Attaque déjà apprise");
    this.attacks.push(attack);
  }

  heal(): void {
    this.lifePoint = this.maxLifePoint;
    this.attacks.forEach((a) => a.reset());
  }

  isKo(): boolean {
    return this.lifePoint <= 0;
  }

  canAttack(): boolean {
    return this.attacks.some((a) => a.isAvailable());
  }

  attack(target: Pokemon): Attack | null {
    const available = this.attacks.filter((a) => a.isAvailable());
    if (available.length === 0) return null;
    const attack = available[Math.floor(Math.random() * available.length)];
    attack.use();
    target.lifePoint = Math.max(0, target.lifePoint - attack.damage);
    return attack;
  }
}
