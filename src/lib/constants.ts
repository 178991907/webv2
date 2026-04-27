import { Leaf, Sparkles, Sun, Heart, Waves, Moon } from "lucide-react";

// 7 child-friendly color themes for ages 6-12 (plus Admin/Adult modes)
export const THEME_MODES = [
    {
        id: 'mint',
        name: '薄荷清新',
        nameEn: 'Mint Fresh',
        icon: Leaf,
        description: '清爽专注 · 自然科学',
        color: 'bg-gradient-to-br from-[#4ECDC4] to-[#95E1D3]',
    },
    {
        id: 'lavender',
        name: '薰衣草梦幻',
        nameEn: 'Lavender Dream',
        icon: Sparkles,
        description: '温柔治愈 · 故事绘本',
        color: 'bg-gradient-to-br from-[#A78BFA] to-[#D6BCFA]',
    },
    {
        id: 'lemon',
        name: '阳光柠檬派',
        nameEn: 'Sunny Lemon',
        icon: Sun,
        description: '活泼元气 · 字母发音',
        color: 'bg-gradient-to-br from-[#FCD34D] to-[#FEF3C7]',
    },
    {
        id: 'candy',
        name: '棉花糖乐园',
        nameEn: 'Cotton Candy',
        icon: Heart,
        description: '甜美梦幻 · 综合启蒙',
        color: 'bg-gradient-to-br from-[#F9A8D4] to-[#E0BBE4]',
    },
    {
        id: 'ocean',
        name: '海洋探险',
        nameEn: 'Ocean Adventure',
        icon: Waves,
        description: '清新活力 · 冒险旅行',
        color: 'bg-gradient-to-br from-[#4C9BFF] to-[#A5D8FF]',
    },
    {
        id: 'galaxy',
        name: '银河探索',
        nameEn: 'Galaxy Explorer',
        icon: Sparkles,
        description: '深邃奥秘 · 宇宙科学',
        color: 'bg-gradient-to-br from-[#1e1b4b] to-[#4c1d95] border border-white/20',
    },
    {
        id: 'midnight',
        name: '极致纯黑',
        nameEn: 'Pure Midnight',
        icon: Moon,
        description: '沉浸专注 · 省电护眼',
        color: 'bg-black border border-white/20',
    },
];
