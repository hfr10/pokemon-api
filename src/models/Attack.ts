export class Attack {
  constructor(
    public id: number,
    public name: string,
    public damage: number,
    public usageLimit: number,
    public usageCount = 0
  ) {}

  isAvailable(): boolean {
    return this.usageCount < this.usageLimit;
  }

  use(): void {
    this.usageCount++;
  }

  reset(): void {
    this.usageCount = 0;
  }

  toString(): string {
    return `${this.name} - dégâts : ${this.damage} - usages : ${this.usageCount}/${this.usageLimit}`;
  }
}
