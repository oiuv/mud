// 普通防具的蓝图属性；按规范 ID 自然排序。
private mapping surcoat_definitions() {
    return ([
        "dudai": ([
            "name": "肚带",
            "ids": ({ "surcoat", "du dai", "dai" }),
            "weight": 500,
            "properties": ({
                ({ "material", "leather" }),
                ({ "unit", "条" }),
                ({ "long", "这是一件皮质的肚带，用以保护腹部。\n" }),
                ({ "value", 800 }),
                ({ "armor_prop/dodge", -3 }),
            }),
        ]),
    ]);
}
