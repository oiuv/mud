// 普通鞋靴共用资产；仅保存品种蓝图默认值，历史路径不参与运行。
private mapping boots_definitions() {
    return ([
        "caoxie": ([
            "name": "草鞋",
            "ids": ({ "sandals", "cao xie", "xie" }),
            "weight": 200,
            "properties": ({
                ({ "material", "wood" }),
                ({ "unit", "双" }),
                ({ "long", "这是一双草编的草鞋，用以保护足部。\n" }),
                ({ "value", 100 }),
                ({ "armor_prop/dodge", 2 })
            }),
        ]),
        "pixue": ([
            "name": "皮靴",
            "ids": ({ "boots", "pi xue", "xue" }),
            "weight": 800,
            "properties": ({
                ({ "material", "leather" }),
                ({ "unit", "双" }),
                ({ "long", "这是一双用上好牛皮作的皮靴，据说由上海进口。用以保护足部。\n" }),
                ({ "value", 1000 }),
                ({ "armor_prop/dodge", 8 })
            }),
        ]),
        "qilinxue": ([
            "name": HIR "麒麟靴" NOR,
            "ids": ({ "qilin xue", "xue", "boots" }),
            "weight": 800,
            "properties": ({
                ({ "material", "leather" }),
                ({ "unit", "双" }),
                ({ "long", HIR "这是一双用上麒麟皮作的皮靴，据说可以赴汤蹈火。用以保护足部。\n" NOR }),
                ({ "value", 100000 }),
                ({ "armor_prop/dodge", 80 })
            }),
        ]),
        "sengxie": ([
            "name": HIC "僧鞋" NOR,
            "ids": ({ "seng xie", "xie" }),
            "weight": 1000,
            "properties": ({
                ({ "unit", "双" }),
                ({ "long", "一双青布僧鞋" }),
                ({ "value", 6000 }),
                ({ "material", "boots" }),
                ({ "armor_prop/dodge", 5 })
            }),
        ]),
        "shaolin_sengxie": ([
            "name": HIC "僧鞋" NOR,
            "ids": ({ "seng xie", "xie" }),
            "weight": 1000,
            "properties": ({
                ({ "unit", "双" }),
                ({ "long", "一双青布僧鞋" }),
                ({ "value", 6000 }),
                ({ "material", "boots" }),
                ({ "armor_prop/dodge", 5 }),
                ({ "shaolin", 1 })
            }),
        ]),
        "xiuhuaxie": ([
            "name": "绣花小鞋",
            "ids": ({ "flower shoes", "shoes" }),
            "weight": 900,
            "properties": ({
                ({ "material", "cloth" }),
                ({ "unit", "双" }),
                ({ "value", 300 }),
                ({ "armor_prop/armor", 1 }),
                ({ "female_only", 1 })
            }),
        ]),
        "xiuhuaxie2": ([
            "name": HIM "绣花小鞋" NOR,
            "ids": ({ "flower shoes", "shoes" }),
            "weight": 900,
            "properties": ({
                ({ "material", "cloth" }),
                ({ "unit", "双" }),
                ({ "long", "一双女人穿的缝制得很精美的绣花鞋。\n" }),
                ({ "value", 0 }),
                ({ "armor_prop/armor", 1 }),
                ({ "female_only", 1 })
            }),
        ]),
        "zhanxue": ([
            "name": "战靴",
            "ids": ({ "zhan xue", "xue", "feet", "zhanxue", "boots" }),
            "weight": 300,
            "properties": ({
                ({ "unit", "双" }),
                ({ "long", "一双皮靴，上等牛皮制成。靴子虽很结实，但颇轻战斗时穿非常方便适用。\n" }),
                ({ "value", 0 }),
                ({ "material", "leather" }),
                ({ "armor_prop/armor", 5 })
            }),
        ])
    ]);
}
