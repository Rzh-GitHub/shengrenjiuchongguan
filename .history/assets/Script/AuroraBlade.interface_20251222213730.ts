// 武器等级属性
interface AuroraBladeLevelData {
    desc: string;           // 升级描述
    level: number;
    amount: number;     // 发射数量
}

// 极光刃等级配置 (1-5级)
export const AuroraBladeLevels: AuroraBladeLevelData[] = [
    {
        desc: '向前发射 1 把飞刀',
        level: 1,
        amount: 1,
    },
    {
        desc: '向前发射 2 把飞刀',
        level: 2,
        amount: 2,
    },
    {
        desc: '向前发射 3 把飞刀',
        level: 3,
        amount: 3,
    },
    {
        desc: '向前发射 4 把飞刀',
        level: 4,
        amount: 4,
    },
    {
        desc: '向前发射 5 把飞刀',
        level: 5,
        amount: 5,
    },
];

// 日月梭配置 (1-5级)
export const SunMoonLevels = [
    { desc: "弹道速度提升 20%", speedMul: 0.2 },
    { desc: "弹道速度提升 20%", speedMul: 0.2 },
    { desc: "弹道速度提升 20%", speedMul: 0.2 },
    { desc: "弹道速度提升 20%", speedMul: 0.2 },
    { desc: "弹道速度提升 20%", speedMul: 0.2 },
];