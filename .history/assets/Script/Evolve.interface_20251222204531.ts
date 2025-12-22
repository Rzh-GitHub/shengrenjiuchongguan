interface IEvolveRecipe {
    weaponName: string;   // 武器脚本名
    passiveName: string;  // 需求宝物名
    minWeaponLevel: number;
}

const EVOLVE_CONFIG: IEvolveRecipe[] = [
    { weaponName: 'KnifeWeapon', passiveName: 'PassiveSunMoon', minWeaponLevel: 8 }
];