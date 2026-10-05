// 普通头饰共用资产；固定属性只用 properties，历史路径仅用于离线迁移。
private mapping headwear_definitions() {
    return ([
        "bai_chahua": ([
            "name": HIW "白茶花" NOR,
            "ids": ({ "bai chahua", "chahua" }),
            "weight": 10,
            "properties": ({
                ({ "long", "冰清玉洁的白茶花。\n" }),
                ({ "unit", "朵" }),
                ({ "value", 6 }),
                ({ "material", "plant" }),
                ({ "armor_prop/armor", 0 }),
                ({ "armor_prop/personality", 3 }),
                ({ "wear_msg", "$N轻轻地把一朵$n戴在头上。\n" }),
                ({ "unwield_msg", "$N轻轻地把$n从头上除了下来。\n" })
            }),
        ]),
        "baihe_hua": ([
            "name": HIW "白合花" NOR,
            "ids": ({ "flower", "hua" }),
            "weight": 10,
            "clone_weight": 0,
            "properties": ({
                ({ "unit", "朵" }),
                ({ "long", "这是一朵美丽的小野花，香气清新。\n" }),
                ({ "value", 0 }),
                ({ "material", "plant" }),
                ({ "armor_prop/armor", 0 }),
                ({ "armor_prop/personality", 3 }),
                ({ "wear_msg", "$N轻轻地把一朵$n戴在头上。\n" }),
                ({ "unequip_msg", "$N轻轻地把$n从头上摘了下来。\n" })
            }),
        ]),
        "chahua1": ([
            "name": HIY "落第秀才" NOR,
            "ids": ({ "cha hua", "hua" }),
            "weight": 10,
            "clone_weight": 0,
            "properties": ({
                ({ "unit", "朵" }),
                ({ "long", "一株盛开的茶花，论颜色，一共是十七种。比十八学士少了一色，
偏又是驳而不纯，开起来或迟或早，花朵又有大有小。它处处东施
效颦，学那十八学士，却总是不像，好似个半瓶醋的酸丁。\n" }),
                ({ "value", 80 }),
                ({ "material", "plant" }),
                ({ "armor_prop/armor", 0 }),
                ({ "armor_prop/personality", 3 }),
                ({ "wear_msg", "$N轻轻地把一朵$n戴在头上。\n" }),
                ({ "unequip_msg", "$N轻轻地把$n从头上摘了下来。\n" })
            }),
        ]),
        "chahua2": ([
            "name": HIR "十八学士" NOR,
            "ids": ({ "cha hua", "hua" }),
            "weight": 10,
            "clone_weight": 0,
            "properties": ({
                ({ "unit", "朵" }),
                ({ "long", "一株茶花，枝上共开十八朵花，朵朵颜色不同，" HIR "红" NOR "的就是全红，" MAG "紫" NOR "
的便是全紫，决无半分混杂。而且十八朵花形状朵朵不同，各有各
的妙处，开时齐开，谢时齐谢，是天下茶花的极品。\n" }),
                ({ "value", 100 }),
                ({ "material", "plant" }),
                ({ "armor_prop/armor", 0 }),
                ({ "armor_prop/personality", 3 }),
                ({ "wear_msg", "$N轻轻地把一朵$n戴在头上。\n" }),
                ({ "unequip_msg", "$N轻轻地把$n从头上摘了下来。\n" })
            }),
        ]),
        "chahua3": ([
            "name": HIG "十三太保" NOR,
            "ids": ({ "cha hua", "hua" }),
            "weight": 10,
            "clone_weight": 0,
            "properties": ({
                ({ "unit", "朵" }),
                ({ "long", "一株茶花，枝上共开十三朵花，朵朵颜色不同，决无半分混杂。而
且十三朵花形状朵朵不同，各有各的妙处，开时齐开，谢时齐谢，
是仅次于十八学士的天下茶花极品。\n" }),
                ({ "value", 90 }),
                ({ "material", "plant" }),
                ({ "armor_prop/armor", 0 }),
                ({ "armor_prop/personality", 3 }),
                ({ "wear_msg", "$N轻轻地把一朵$n戴在头上。\n" }),
                ({ "unequip_msg", "$N轻轻地把$n从头上摘了下来。\n" })
            }),
        ]),
        "chahua4": ([
            "name": HIB "八仙过海" NOR,
            "ids": ({ "cha hua", "hua" }),
            "weight": 10,
            "clone_weight": 0,
            "properties": ({
                ({ "unit", "朵" }),
                ({ "long", "一株茶花，八朵异色同株，枝上共开八朵花，" MAG "深紫" NOR "和" HIR "淡红" NOR "的花各一
朵，那是铁拐李和何仙姑，朵朵颜色不同，红花最小。而且形状朵
朵不同，各有其妙。\n" }),
                ({ "value", 85 }),
                ({ "material", "plant" }),
                ({ "armor_prop/armor", 0 }),
                ({ "armor_prop/personality", 3 }),
                ({ "wear_msg", "$N轻轻地把一朵$n戴在头上。\n" }),
                ({ "unequip_msg", "$N轻轻地把$n从头上摘了下来。\n" })
            }),
        ]),
        "chahua5": ([
            "name": HIR "七仙女" NOR,
            "ids": ({ "cha hua", "hua" }),
            "weight": 10,
            "clone_weight": 0,
            "properties": ({
                ({ "unit", "朵" }),
                ({ "long", "一株茶花，七朵异色同株，枝上共开七朵花，朵朵颜色不同，而且形
状朵朵不同，各有其妙。\n" }),
                ({ "value", 80 }),
                ({ "material", "plant" }),
                ({ "armor_prop/armor", 0 }),
                ({ "armor_prop/personality", 3 }),
                ({ "wear_msg", "$N轻轻地把一朵$n戴在头上。\n" }),
                ({ "unequip_msg", "$N轻轻地把$n从头上摘了下来。\n" })
            }),
        ]),
        "chahua6": ([
            "name": MAG "风" WHT "尘三" HIR "侠" NOR,
            "ids": ({ "cha hua", "hua" }),
            "weight": 10,
            "clone_weight": 0,
            "properties": ({
                ({ "unit", "朵" }),
                ({ "long", "一株茶花，同株开着三朵花，三朵花中" MAG "紫色" NOR "者最大，那是虬髯客，" WHT "白
色" NOR "者次之，那是李靖，" HIR "红色" NOR "者最娇艳而最小，那是红拂女。朵朵颜色
不同，而且形状朵朵不同，各有其妙。\n" }),
                ({ "value", 80 }),
                ({ "material", "plant" }),
                ({ "armor_prop/armor", 0 }),
                ({ "armor_prop/personality", 3 }),
                ({ "wear_msg", "$N轻轻地把一朵$n戴在头上。\n" }),
                ({ "unequip_msg", "$N轻轻地把$n从头上摘了下来。\n" })
            }),
        ]),
        "chahua7": ([
            "name": HIR "二" WHT "乔" NOR,
            "ids": ({ "cha hua", "hua" }),
            "weight": 10,
            "clone_weight": 0,
            "properties": ({
                ({ "unit", "朵" }),
                ({ "long", "一株茶花，同株开着两朵花，一朵花色" HIR "纯红" NOR "，一朵" WHT "纯白" NOR "，各有其妙。\n" }),
                ({ "value", 75 }),
                ({ "material", "plant" }),
                ({ "armor_prop/armor", 0 }),
                ({ "armor_prop/personality", 3 }),
                ({ "wear_msg", "$N轻轻地把一朵$n戴在头上。\n" }),
                ({ "unequip_msg", "$N轻轻地把$n从头上摘了下来。\n" })
            }),
        ]),
        "chahua8": ([
            "name": HIG "八宝妆" NOR,
            "ids": ({ "cha hua", "hua" }),
            "weight": 10,
            "clone_weight": 0,
            "properties": ({
                ({ "unit", "朵" }),
                ({ "long", "一株茶花，八朵异色同株，枝上共开八朵花，朵朵颜色不同，而且形
状朵朵不同，各有其妙。\n" }),
                ({ "value", 50 }),
                ({ "material", "plant" }),
                ({ "armor_prop/armor", 0 }),
                ({ "armor_prop/personality", 3 }),
                ({ "wear_msg", "$N轻轻地把一朵$n戴在头上。\n" }),
                ({ "unequip_msg", "$N轻轻地把$n从头上摘了下来。\n" })
            }),
        ]),
        "chahua9": ([
            "name": HIW "满月" NOR,
            "ids": ({ "cha hua", "hua" }),
            "weight": 10,
            "clone_weight": 0,
            "properties": ({
                ({ "unit", "朵" }),
                ({ "long", "一株茶花，大白花而微有隐隐黑斑的，那些黑斑，便是月中的桂枝。\n" }),
                ({ "value", 50 }),
                ({ "material", "plant" }),
                ({ "armor_prop/armor", 0 }),
                ({ "armor_prop/personality", 3 }),
                ({ "wear_msg", "$N轻轻地把一朵$n戴在头上。\n" }),
                ({ "unequip_msg", "$N轻轻地把$n从头上摘了下来。\n" })
            }),
        ]),
        "chahua10": ([
            "name": HIB "眼" HIW "儿媚" NOR,
            "ids": ({ "cha hua", "hua" }),
            "weight": 10,
            "clone_weight": 0,
            "properties": ({
                ({ "unit", "朵" }),
                ({ "long", "一株茶花，白色花瓣上有两个橄榄核儿黑斑。\n" }),
                ({ "value", 50 }),
                ({ "material", "plant" }),
                ({ "armor_prop/armor", 0 }),
                ({ "armor_prop/personality", 3 }),
                ({ "wear_msg", "$N轻轻地把一朵$n戴在头上。\n" }),
                ({ "unequip_msg", "$N轻轻地把$n从头上摘了下来。\n" })
            }),
        ]),
        "chahua11": ([
            "name": HIR "红妆" HIW "素裹" NOR,
            "ids": ({ "cha hua", "hua" }),
            "weight": 10,
            "clone_weight": 0,
            "properties": ({
                ({ "unit", "朵" }),
                ({ "long", "一株茶花，白色花瓣上似乎洒了些红斑。\n" }),
                ({ "value", 50 }),
                ({ "material", "plant" }),
                ({ "armor_prop/armor", 0 }),
                ({ "armor_prop/personality", 3 }),
                ({ "wear_msg", "$N轻轻地把一朵$n戴在头上。\n" }),
                ({ "unequip_msg", "$N轻轻地把$n从头上摘了下来。\n" })
            }),
        ]),
        "chahua12": ([
            "name": HIW "抓破" HIG "美" NOR "人" HIR "脸" NOR,
            "ids": ({ "cha hua", "hua" }),
            "weight": 10,
            "clone_weight": 0,
            "properties": ({
                ({ "unit", "朵" }),
                ({ "long", "一株茶花，白色花瓣上有一抹绿晕、一丝红条。\n" }),
                ({ "value", 50 }),
                ({ "material", "plant" }),
                ({ "armor_prop/armor", 0 }),
                ({ "armor_prop/personality", 3 }),
                ({ "wear_msg", "$N轻轻地把一朵$n戴在头上。\n" }),
                ({ "unequip_msg", "$N轻轻地把$n从头上摘了下来。\n" })
            }),
        ]),
        "chahua13": ([
            "name": HIW "倚" HIG "栏" HIR "娇" NOR,
            "ids": ({ "cha hua", "hua" }),
            "weight": 10,
            "clone_weight": 0,
            "properties": ({
                ({ "unit", "朵" }),
                ({ "long", "一株茶花，白色花瓣上有一抹绿晕、一长列红条。\n" }),
                ({ "value", 50 }),
                ({ "material", "plant" }),
                ({ "armor_prop/armor", 0 }),
                ({ "armor_prop/personality", 3 }),
                ({ "wear_msg", "$N轻轻地把一朵$n戴在头上。\n" }),
                ({ "unequip_msg", "$N轻轻地把$n从头上摘了下来。\n" })
            }),
        ]),
        "cuiyu": ([
            "name": HIG "翠羽" NOR,
            "ids": ({ "cui yu", "yu" }),
            "weight": 10,
            "clone_weight": 0,
            "properties": ({
                ({ "unit", "支" }),
                ({ "long", "一支翠绿的羽毛。\n" }),
                ({ "value", 800 }),
                ({ "material", "plant" }),
                ({ "armor_prop/armor", 10 }),
                ({ "armor_prop/personality", 3 }),
                ({ "wear_msg", "$N轻轻地把一朵$n戴在头上。\n" }),
                ({ "unequip_msg", "$N轻轻地把$n从头上摘了下来。\n" })
            }),
        ]),
        "gangkui": ([
            "name": "钢盔",
            "ids": ({ "gang kui", "gangkui", "kui", "helmet" }),
            "weight": 800,
            "properties": ({
                ({ "unit", "顶" }),
                ({ "material", "steel" }),
                ({ "long", "一顶结实的钢盔。\n" }),
                ({ "value", 0 }),
                ({ "armor_prop/armor", 5 })
            }),
        ]),
        "hei_mudan": ([
            "name": BLU "黑牡丹" NOR,
            "ids": ({ "hei mudan", "mudan" }),
            "weight": 10,
            "properties": ({
                ({ "long", "清高冷傲的黑牡丹。\n" }),
                ({ "unit", "朵" }),
                ({ "value", 6 }),
                ({ "material", "plant" }),
                ({ "armor_prop/armor", 0 }),
                ({ "armor_prop/personality", 3 }),
                ({ "wear_msg", "$N轻轻地把一朵$n戴在头上。\n" }),
                ({ "unwield_msg", "$N轻轻地把$n从头上除了下来。\n" }),
                ({ "female_only", 1 })
            }),
        ]),
        "hong_meigui": ([
            "name": HIR "玫瑰" NOR,
            "ids": ({ "rose", "meigui" }),
            "weight": 10,
            "properties": ({
                ({ "unit", "朵" }),
                ({ "long", "一朵红色的玫瑰，花瓣里透出一股凄然。\n" }),
                ({ "value", 10 }),
                ({ "material", "plant" }),
                ({ "armor_prop/armor", 0 }),
                ({ "armor_prop/personality", 3 }),
                ({ "wear_msg", HIC "$N" HIC "轻轻地把一朵$n"
                    HIC "戴在头上，嫣然一笑。\n" }),
                ({ "remove_msg", HIC "$N" HIC "幽幽的叹了"
                    "口气，把$n" HIC "从头上摘了下来。\n" })
            }),
        ]),
        "hong_meigui2": ([
            "name": HIR "红玫瑰" NOR,
            "ids": ({ "hong meigui", "meigui" }),
            "weight": 10,
            "properties": ({
                ({ "long", "热奔奔放的红玫瑰。\n" }),
                ({ "unit", "朵" }),
                ({ "no_sell", 1 }),
                ({ "value", 100000 }),
                ({ "material", "plant" }),
                ({ "armor_prop/armor", 0 }),
                ({ "armor_prop/personality", 3 }),
                ({ "wear_msg", "$N轻轻地把一朵$n戴在头上。\n" }),
                ({ "unwield_msg", "$N轻轻地把$n从头上除了下来。\n" }),
                ({ "female_only", 1 })
            }),
        ]),
        "hong_meigui3": ([
            "name": HIR "玫瑰" NOR,
            "ids": ({ "rose", "meigui" }),
            "weight": 10,
            "properties": ({
                ({ "unit", "朵" }),
                ({ "no_sell", 1 }),
                ({ "long", HIR "一朵红色的玫瑰，花瓣里透出一股凄然。\n" NOR }),
                ({ "value", 100000 }),
                ({ "material", "plant" }),
                ({ "armor_prop/armor", 0 }),
                ({ "armor_prop/personality", 3 }),
                ({ "wear_msg", HIC "$N" HIC "轻轻地把一朵$n"
                    HIC "戴在头上，嫣然一笑。\n" }),
                ({ "remove_msg", HIC "$N" HIC "幽幽的叹了"
                    "口气，把$n" HIC "从头上摘了下来。\n" })
            }),
        ]),
        "huang_meigui": ([
            "name": HIY "玫瑰" NOR,
            "ids": ({ "rose", "meigui" }),
            "weight": 10,
            "properties": ({
                ({ "unit", "朵" }),
                ({ "long", HIY "一朵黄色的玫瑰。\n" NOR }),
                ({ "value", 10 }),
                ({ "material", "plant" }),
                ({ "armor_prop/armor", 0 }),
                ({ "armor_prop/personality", 3 }),
                ({ "wear_msg", HIC "$N" HIC "轻轻地把一朵$n"
                    HIC "戴在头上，衬得明眸好齿更加动人。\n" }),
                ({ "remove_msg", HIC "$N" HIC "轻轻的叹了"
                    "口气，把$n" HIC "从头上摘了下来。\n" })
            }),
        ]),
        "huang_meigui2": ([
            "name": HIY "黄玫瑰" NOR,
            "ids": ({ "huang meigui", "meigui" }),
            "weight": 10,
            "properties": ({
                ({ "long", "含情脉脉的黄玫瑰。\n" }),
                ({ "unit", "朵" }),
                ({ "value", 6 }),
                ({ "material", "plant" }),
                ({ "armor_prop/armor", 0 }),
                ({ "armor_prop/personality", 3 }),
                ({ "wear_msg", "$N轻轻地把一朵$n戴在头上。\n" }),
                ({ "unwield_msg", "$N轻轻地把$n从头上除了下来。\n" }),
                ({ "female_only", 1 })
            }),
        ]),
        "huilan_hua": ([
            "name": HIB "蕙兰花" NOR,
            "ids": ({ "flower", "hua" }),
            "weight": 10,
            "clone_weight": 0,
            "properties": ({
                ({ "unit", "朵" }),
                ({ "long", "这是一朵美丽的小野花，香气清新。\n" }),
                ({ "value", 0 }),
                ({ "material", "plant" }),
                ({ "armor_prop/armor", 0 }),
                ({ "armor_prop/personality", 3 }),
                ({ "wear_msg", "$N轻轻地把一朵$n戴在头上。\n" }),
                ({ "unequip_msg", "$N轻轻地把$n从头上摘了下来。\n" })
            }),
        ]),
        "jindai": ([
            "name": "束发金带",
            "ids": ({ "jindai" }),
            "weight": 50,
            "properties": ({
                ({ "unit", "条" }),
                ({ "value", 1500 }),
                ({ "material", "silk" }),
                ({ "armor_prop/armor", 1 }),
                ({ "wear_msg", "$N将$n拿出束在头发上。\n" })
            }),
        ]),
        "jindai2": ([
            "name": "束发金带",
            "ids": ({ "jindai" }),
            "weight": 50,
            "properties": ({
                ({ "unit", "条" }),
                ({ "long", "这是一条用金丝织成的束发带子\n" }),
                ({ "value", 1500 }),
                ({ "material", "silk" }),
                ({ "armor_prop/armor", 1 }),
                ({ "female_only", 1 }),
                ({ "wear_msg", "$N将$n拿出束在头发上。\n" })
            }),
        ]),
        "lan_tiane": ([
            "name": HIB "蓝天鹅" NOR,
            "ids": ({ "lan tiane", "tiane" }),
            "weight": 10,
            "properties": ({
                ({ "long", "庄重朴实的蓝天鹅。\n" }),
                ({ "unit", "朵" }),
                ({ "value", 6 }),
                ({ "material", "plant" }),
                ({ "armor_prop/armor", 0 }),
                ({ "armor_prop/personality", 3 }),
                ({ "wear_msg", "$N轻轻地把一朵$n戴在头上。\n" }),
                ({ "unwield_msg", "$N轻轻地把$n从头上除了下来。\n" }),
                ({ "female_only", 1 })
            }),
        ]),
        "maozi": ([
            "name": "帽子",
            "ids": ({ "hat" }),
            "weight": 3000,
            "properties": ({
                ({ "unit", "件" }),
                ({ "value", 500 }),
                ({ "material", "hat" }),
                ({ "armor_prop/armor", 2 })
            }),
        ]),
        "shaluo_hua": ([
            "name": HIR "莎椤花" NOR,
            "ids": ({ "flower", "hua" }),
            "weight": 10,
            "clone_weight": 0,
            "properties": ({
                ({ "unit", "朵" }),
                ({ "long", "这是一朵美丽的小野花，香气清新。\n" }),
                ({ "value", 0 }),
                ({ "material", "plant" }),
                ({ "armor_prop/armor", 0 }),
                ({ "armor_prop/personality", 3 }),
                ({ "wear_msg", "$N轻轻地把一朵$n戴在头上。\n" }),
                ({ "unequip_msg", "$N轻轻地把$n从头上摘了下来。\n" })
            }),
        ]),
        "shaolin_toukui": ([
            "name": HIC "头盔" NOR,
            "ids": ({ "tou kui", "kui" }),
            "weight": 500,
            "properties": ({
                ({ "unit", "顶" }),
                ({ "long", "这是一顶金属头盔，用以保护头部。\n" }),
                ({ "value", 100 }),
                ({ "material", "head" }),
                ({ "armor_prop/armor", 10 }),
                ({ "shaolin", 1 })
            }),
        ]),
        "taiyi_toujin": ([
            "name": "台夷头巾",
            "ids": ({ "tou jin" }),
            "weight": 2000,
            "properties": ({
                ({ "material", "steel" }),
                ({ "unit", "条" }),
                ({ "long", "这是一条台夷头巾，用以缠绕头部。\n" }),
                ({ "value", 1500 }),
                ({ "armor_prop/dodge", -5 })
            }),
        ]),
        "tie_toukui": ([
            "name": "头盔",
            "ids": ({ "helmet", "toukui" }),
            "weight": 2000,
            "properties": ({
                ({ "material", "steel" }),
                ({ "unit", "顶" }),
                ({ "long", "这是一顶铁质的肚带，用以保护头部。\n" }),
                ({ "value", 1500 }),
                ({ "armor_prop/dodge", -5 })
            }),
        ]),
        "toukui": ([
            "name": HIC "头盔" NOR,
            "ids": ({ "tou kui", "kui" }),
            "weight": 500,
            "properties": ({
                ({ "unit", "顶" }),
                ({ "long", "这是一顶金属头盔，用以保护头部。\n" }),
                ({ "value", 100 }),
                ({ "material", "head" }),
                ({ "armor_prop/armor", 10 })
            }),
        ]),
        "zangseng_mao": ([
            "name": HIR "僧帽" NOR,
            "ids": ({ "seng mao", "mao" }),
            "weight": 500,
            "properties": ({
                ({ "unit", "顶" }),
                ({ "long", "这是一顶藏僧戴的僧帽。\n" }),
                ({ "value", 100 }),
                ({ "material", "head" }),
                ({ "armor_prop/armor", 10 }),
                ({ "xueshan", 1 })
            }),
        ]),
        "zi_luolan": ([
            "name": HIM "紫罗兰" NOR,
            "ids": ({ "zi luolan", "luolan" }),
            "weight": 10,
            "properties": ({
                ({ "long", "高贵典雅的紫罗兰，闻起来还有一股淡淡的香味儿。\n" }),
                ({ "unit", "朵" }),
                ({ "value", 6 }),
                ({ "material", "plant" }),
                ({ "armor_prop/armor", 0 }),
                ({ "armor_prop/personality", 3 }),
                ({ "wear_msg", "$N轻轻地把一朵$n戴在头上。\n" }),
                ({ "unwield_msg", "$N轻轻地把$n从头上除了下来。\n" }),
                ({ "female_only", 1 })
            }),
        ]),
        "zitan_fochuan": ([
            "name": MAG "紫檀佛串" NOR,
            "ids": ({ "fo chuan" }),
            "weight": 1000,
            "properties": ({
                ({ "material", "wood" }),
                ({ "unit", "条" }),
                ({ "armor_prop/armor", 10 })
            }),
        ])
    ]);
}
