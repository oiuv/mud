// 普通防具的蓝图属性；按规范 ID 自然排序。
private mapping waist_definitions() {
    return ([
        "huyao": ([
            "name": "护腰",
            "ids": ({ "waist", "hu yao", "huyao" }),
            "weight": 500,
            "properties": ({
                ({ "unit", "条" }),
                ({ "long", "这是一条皮质的护腰，用以保护腰部。\n" }),
                ({ "value", 1600 }),
                ({ "material", "leather" }),
                ({ "armor_prop/armor", 5 }),
            }),
        ]),
        "shaolin_huyao": ([
            "name": "铁护腰",
            "ids": ({ "hu yao", "huyao" }),
            "weight": 500,
            "properties": ({
                ({ "unit", "条" }),
                ({ "long", "这是一件皮质的护腰，上面满布铁钉，用以保护腰部。\n" }),
                ({ "value", 6000 }),
                ({ "material", "waist" }),
                ({ "armor_prop/armor", 5 }),
                ({ "shaolin", 1 }),
            }),
        ]),
        "tie_huyao": ([
            "name": "铁护腰",
            "ids": ({ "hu yao", "huyao" }),
            "weight": 500,
            "properties": ({
                ({ "unit", "条" }),
                ({ "long", "这是一件皮质的护腰，上面满布铁钉，用以保护腰部。\n" }),
                ({ "value", 6000 }),
                ({ "material", "waist" }),
                ({ "armor_prop/armor", 5 }),
            }),
        ]),
    ]);
}
