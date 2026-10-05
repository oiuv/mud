// 颈饰共用资产；固定属性只用 properties，历史路径仅用于离线迁移。
private mapping neck_definitions() {
    return ([
        "baijin_quan": ([
            "name": HIW "白金项圈" NOR,
            "ids": ({ "baijin xiangquan", "xiangquan", "neck" }),
            "weight": 0,
            "properties": ({
                ({ "weight", 200 }),
                ({ "unit", "个" }),
                ({ "value", 3500 }),
                ({ "material", "gold" }),
                ({ "armor_prop/armor", 1 })
            }),
        ]),
        "beike_lian": ([
            "name": "贝壳项链",
            "ids": ({ "shell lace", "lace" }),
            "weight": 500,
            "properties": ({
                ({ "unit", "串" }),
                ({ "value", 2500 }),
                ({ "armor_prop/armor", 5 })
            }),
        ]),
        "jinxianglian": ([
            "name": "金项链",
            "ids": ({ "golden necklace", "necklace", "lace" }),
            "weight": 500,
            "properties": ({
                ({ "unit", "串" }),
                ({ "value", 2500 }),
                ({ "material", "gold" }),
                ({ "armor_prop/armor", 1 })
            }),
        ]),
        "jinxianglian2": ([
            "name": "金项链",
            "ids": ({ "golden necklace", "necklace", "lace" }),
            "weight": 0,
            "properties": ({
                ({ "weight", 500 }),
                ({ "unit", "串" }),
                ({ "value", 2500 }),
                ({ "material", "gold" }),
                ({ "armor_prop/armor", 1 })
            }),
        ]),
        "shane_bu": ([
            "name": "赏善罚恶簿",
            "ids": ({ "shane bu", "bu" }),
            "weight": 300,
            "properties": ({
                ({ "long", "这是一本赏善罚恶簿，里头记载着江湖善恶。\n" }),
                ({ "unit", "本" }),
                ({ "material", "paper" })
            }),
        ]),
        "shaolin_weibo": ([
            "name": HIC "围脖" NOR,
            "ids": ({ "wei bo", "bo" }),
            "weight": 500,
            "properties": ({
                ({ "unit", "条" }),
                ({ "long", "这是一皮围脖，用以保护颈部。\n" }),
                ({ "value", 100 }),
                ({ "material", "neck" }),
                ({ "armor_prop/armor", 3 }),
                ({ "shaolin", 1 })
            }),
        ]),
        "weibo": ([
            "name": HIC "围脖" NOR,
            "ids": ({ "wei bo", "bo" }),
            "weight": 500,
            "properties": ({
                ({ "unit", "条" }),
                ({ "long", "这是一皮围脖，用以保护颈部。\n" }),
                ({ "value", 100 }),
                ({ "material", "neck" }),
                ({ "armor_prop/armor", 3 })
            }),
        ]),
        "xiangquan": ([
            "name": "武者项圈",
            "ids": ({ "neck-cycle", "xiang quan", "lian" }),
            "weight": 1000,
            "properties": ({
                ({ "material", "steel" }),
                ({ "unit", "串" }),
                ({ "long", "这是一串铁质的项链，用以保护颈部。\n" }),
                ({ "value", 1800 }),
                ({ "armor_prop/dodge", 5 })
            }),
        ]),
        "xuantie_ling": ([
            "name": HIC "玄铁令" NOR,
            "ids": ({ "xuan tie", "xuan" }),
            "weight": 300,
            "properties": ({
                ({ "long", "\n这是一块碧绿色的玉牌，莹洁光绿，真是一块好玉。\n" +
                    "正面雕龙刻凤，正中写着玄铁两个大字。这便是江湖上传说的玄铁令。\n" }),
                ({ "unit", "块" }),
                ({ "value", 50000 }),
                ({ "material", "玉" }),
                ({ "armor_prop/armor", 2 }),
                ({ "female_only", 1 })
            }),
        ]),
        "yupei": ([
            "name": "龙凤玉佩",
            "ids": ({ "yu pei" }),
            "weight": 800,
            "properties": ({
                ({ "unit", "个" }),
                ({ "value", 2000 }),
                ({ "long", "一枚玉佩，上面雕刻着龙凤图案．\n" }),
                ({ "no_sell", 1 }),
                ({ "material", "steel" }),
                ({ "armor_prop/dodge", 10 }),
                ({ "armor_prop/armor", 2 })
            }),
        ])
    ]);
}
