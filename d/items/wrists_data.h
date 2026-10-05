// 护腕共用资产；固定属性只用 properties，历史路径仅用于离线迁移。
private mapping wrists_definitions() {
    return ([
        "huwan": ([
            "name": "护腕",
            "ids": ({ "wrists", "hu wan", "huwan" }),
            "weight": 500,
            "properties": ({
                ({ "unit", "双" }),
                ({ "long", "这是一件布质的护腕，用以保护腕部。\n" }),
                ({ "value", 1300 }),
                ({ "material", "cloth" }),
                ({ "armor_prop/armor", 5 })
            }),
        ]),
        "shaolin_huwan": ([
            "name": "铁护腕",
            "ids": ({ "hu wan", "huwan" }),
            "weight": 500,
            "properties": ({
                ({ "unit", "双" }),
                ({ "long", "这是一件皮质的护腕，上面满布铁钉，用以保护腕部。\n" }),
                ({ "value", 6000 }),
                ({ "material", "wrists" }),
                ({ "armor_prop/armor", 5 }),
                ({ "shaolin", 1 })
            }),
        ]),
        "tie_huwan": ([
            "name": "铁护腕",
            "ids": ({ "hu wan", "huwan" }),
            "weight": 500,
            "properties": ({
                ({ "unit", "双" }),
                ({ "long", "这是一件皮质的护腕，上面满布铁钉，用以保护腕部。\n" }),
                ({ "value", 6000 }),
                ({ "material", "wrists" }),
                ({ "armor_prop/armor", 5 })
            }),
        ]),
        "wanlian": ([
            "name": HIY "鎏金腕链" NOR,
            "ids": ({ "liujin wanlian", "wanlian", "wrists" }),
            "weight": 0,
            "properties": ({
                ({ "weight", 200 }),
                ({ "unit", "个" }),
                ({ "value", 5000 }),
                ({ "material", "gold" }),
                ({ "armor_prop/armor", 1 })
            }),
        ])
    ]);
}
