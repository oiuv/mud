// 手部装备共用资产；固定属性只用 properties，历史路径仅用于离线迁移。
private mapping hands_definitions() {
    return ([
        "baijie": ([
            "name": "白金戒指",
            "ids": ({ "bai jie", "baijie", "ring" }),
            "weight": 0,
            "properties": ({
                ({ "weight", 400 }),
                ({ "unit", "个" }),
                ({ "value", 10000 }),
                ({ "material", "gold" }),
                ({ "armor_prop/armor", 1 }),
                ({ "armor_prop/personality", 1 })
            }),
        ]),
        "baojie": ([
            "name": "宝石戒指",
            "ids": ({ "bao jie", "baojie", "ring" }),
            "weight": 0,
            "properties": ({
                ({ "weight", 400 }),
                ({ "unit", "个" }),
                ({ "value", 10000 }),
                ({ "material", "gold" }),
                ({ "armor_prop/armor", 1 }),
                ({ "armor_prop/personality", 1 })
            }),
        ]),
        "canxue_shoutao": ([
            "name": RED "残血手套" NOR,
            "ids": ({ "canxue shoutao", "shoutao", "canxue", "hand", "tao" }),
            "weight": 20000,
            "properties": ({
                ({ "unit", "双" }),
                ({ "long", RED "传说中的上古神器。\n" NOR }),
                ({ "value", 100000 }),
                ({ "rigidity", 8000 }),
                ({ "material", "steel" }),
                ({ "armor_prop/armor", 100 })
            }),
        ]),
        "jinjie": ([
            "name": "金戒指",
            "ids": ({ "golden ring", "ring" }),
            "weight": 400,
            "properties": ({
                ({ "unit", "个" }),
                ({ "value", 2000 }),
                ({ "material", "gold" }),
                ({ "armor_prop/armor", 1 })
            }),
        ]),
        "jinjie2": ([
            "name": "金戒指",
            "ids": ({ "jin jie", "jinjie", "ring" }),
            "weight": 0,
            "properties": ({
                ({ "weight", 400 }),
                ({ "unit", "个" }),
                ({ "value", 10000 }),
                ({ "material", "gold" }),
                ({ "armor_prop/armor", 1 }),
                ({ "armor_prop/personality", 1 })
            }),
        ]),
        "jinsi_shoutao": ([
            "name": HIY "金丝手套" NOR,
            "ids": ({ "jinsi shoutao", "shoutao", "jinsi" }),
            "weight": 2900,
            "properties": ({
                ({ "long", HIY "这是一双用金丝编制而成的手套，戴上他可以拿取或触摸带毒的物品而不会中毒。\n" NOR }),
                ({ "unit", "双" }),
                ({ "material", "iron" }),
                ({ "value", 500 }),
                ({ "no_sell", "这你也卖？\n" }),
                ({ "armor_prop/armor", 1 })
            }),
        ]),
        "panlong_gong": ([
            "name": HIY "点金盘龙弓" NOR,
            "ids": ({ "panlong gong", "gong", "panlong" }),
            "weight": 500,
            "properties": ({
                ({ "unit", "支" }),
                ({ "value", 8000 }),
                ({ "armor_prop/armor", 1 }),
                ({ "armor_prop/hand", 1 }),
                ({ "armor_prop/strike", 1 }),
                ({ "armor_prop/unarmed_damage", 3 })
            }),
        ]),
        "shaolin_shoutao": ([
            "name": "皮手套",
            "ids": ({ "pi shoutao", "shoutao" }),
            "weight": 500,
            "properties": ({
                ({ "unit", "双" }),
                ({ "long", "这是一双皮手套，上面有硬物刻勒的痕迹。\n" }),
                ({ "value", 3000 }),
                ({ "armor_prop/armor", 1 }),
                ({ "armor_prop/hand", 1 }),
                ({ "armor_prop/strike", 1 }),
                ({ "armor_prop/unarmed_damage", 3 }),
                ({ "shaolin", 1 })
            }),
        ]),
        "shaolin_tieshou": ([
            "name": "铁手掌",
            "ids": ({ "iron hand", "hand" }),
            "weight": 2000,
            "properties": ({
                ({ "material", "steel" }),
                ({ "unit", "块" }),
                ({ "value", 500 }),
                ({ "armor_prop/armor", 1 }),
                ({ "armor_prop/hand", 5 }),
                ({ "armor_prop/strike", 5 }),
                ({ "armor_prop/unarmed_damage", 20 }),
                ({ "shaolin", 1 })
            }),
        ]),
        "shaolin_zhitao": ([
            "name": "铁指套",
            "ids": ({ "zhitao", "zhi tao" }),
            "weight": 500,
            "properties": ({
                ({ "unit", "副" }),
                ({ "long", "这是五个环环相链的铁指套，前端锋利如"
                    "刃，既可暗藏掌中伤人，又可保护指关节。\n" }),
                ({ "value", 6000 }),
                ({ "material", "finger" }),
                ({ "armor_prop/armor", 5 }),
                ({ "armor_prop/finger", 5 }),
                ({ "armor_prop/unarmed_damage", 20 }),
                ({ "shaolin", 1 })
            }),
        ]),
        "shoutao": ([
            "name": "皮手套",
            "ids": ({ "gloves", "pi shoutao", "shoutao" }),
            "weight": 500,
            "properties": ({
                ({ "unit", "双" }),
                ({ "long", "这是一双皮手套，上面有硬物刻勒的痕迹。\n" }),
                ({ "value", 4000 }),
                ({ "material", "leather" }),
                ({ "armor_prop/armor", 3 })
            }),
        ]),
        "shoutao2": ([
            "name": "皮手套",
            "ids": ({ "pi shoutao", "shoutao" }),
            "weight": 500,
            "properties": ({
                ({ "unit", "双" }),
                ({ "long", "这是一双皮手套，上面有硬物刻勒的痕迹。\n" }),
                ({ "value", 6000 }),
                ({ "material", "hands" }),
                ({ "armor_prop/armor", 3 })
            }),
        ]),
        "tieshou": ([
            "name": "铁手掌",
            "ids": ({ "iron hand", "hand" }),
            "weight": 2000,
            "properties": ({
                ({ "material", "steel" }),
                ({ "unit", "块" }),
                ({ "long", "这是一块铁质的手掌形护具，用以保护手掌。\n" }),
                ({ "value", 900 }),
                ({ "armor_prop/armor", 1 })
            }),
        ]),
        "tieshou2": ([
            "name": "铁手掌",
            "ids": ({ "iron hand", "hand" }),
            "weight": 2000,
            "properties": ({
                ({ "material", "steel" }),
                ({ "unit", "块" }),
                ({ "value", 5 }),
                ({ "armor_prop/armor", 1 })
            }),
        ]),
        "yinjie": ([
            "name": "银戒指",
            "ids": ({ "yin jie", "yinjie", "ring" }),
            "weight": 0,
            "properties": ({
                ({ "weight", 400 }),
                ({ "unit", "个" }),
                ({ "value", 1000 }),
                ({ "material", "silver" }),
                ({ "armor_prop/armor", 1 }),
                ({ "armor_prop/personality", 1 })
            }),
        ]),
        "zhitao": ([
            "name": "指套",
            "ids": ({ "finger", "zhitao" }),
            "weight": 500,
            "properties": ({
                ({ "unit", "副" }),
                ({ "long", "这是五个环环相链的铁指套，前端锋利如刃，既可暗藏掌中伤人，又可保护指关节。\n" }),
                ({ "value", 6000 }),
                ({ "material", "steel" }),
                ({ "armor_prop/armor", 5 })
            }),
        ]),
        "zhitao2": ([
            "name": "指套",
            "ids": ({ "finger", "zhitao" }),
            "weight": 500,
            "properties": ({
                ({ "unit", "副" }),
                ({ "long", "这是五个环环相链的铁指套，前端锋利如刃，既可暗藏掌中伤人，又可保护指关节。\n" }),
                ({ "value", 6000 }),
                ({ "material", "steel" }),
                ({ "armor_prop/armor", 5 }),
                ({ "armor_prop/unarmed_damage", 5 })
            }),
        ]),
        "zhitao3": ([
            "name": "铁指套",
            "ids": ({ "zhitao", "zhi tao" }),
            "weight": 500,
            "properties": ({
                ({ "unit", "副" }),
                ({ "long", "这是五个环环相链的铁指套，前端锋利如刃，既可暗藏掌中伤人，又可保护指关节。\n" }),
                ({ "value", 6000 }),
                ({ "material", "finger" }),
                ({ "armor_prop/armor", 5 })
            }),
        ]),
        "zijin_jie": ([
            "name": MAG "紫金戒指" NOR,
            "ids": ({ "zijin jiezhi", "jiezhi", "ring" }),
            "weight": 0,
            "properties": ({
                ({ "weight", 100 }),
                ({ "unit", "个" }),
                ({ "value", 1000 }),
                ({ "material", "gold" }),
                ({ "armor_prop/armor", 1 })
            }),
        ]),
        "zuanjie": ([
            "name": "钻石戒指",
            "ids": ({ "zuan jie", "zuanjie", "ring" }),
            "weight": 0,
            "properties": ({
                ({ "weight", 400 }),
                ({ "unit", "个" }),
                ({ "value", 12000 }),
                ({ "material", "diamond" }),
                ({ "armor_prop/armor", 1 }),
                ({ "armor_prop/personality", 1 })
            }),
        ])
    ]);
}
