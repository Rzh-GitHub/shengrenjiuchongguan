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
        desc: '向前发射 1 把飞刀',
        level: 1,
        amount: 1,
    },
    {
        desc: '向前发射 1 把飞刀',
        level: 1,
        amount: 1,
    },
    {
        desc: '向前发射 1 把飞刀',
        level: 1,
        amount: 1,
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