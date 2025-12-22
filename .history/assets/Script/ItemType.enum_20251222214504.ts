    // LevelUpItem.ts
export enum ItemType {
    Weapon,
    Passive
}

export interface ILevelUpData {
    id: string;         // 唯一标识，如 "KnifeWeapon"
    type: ItemType;
    name: string;       // 显示的名称
    desc: string;       // 显示的描述
    iconPath: string;   // 资源路径
    level: number;      // 即将升到的等级
}