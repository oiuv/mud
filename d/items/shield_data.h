// 普通防具的蓝图属性；按规范 ID 自然排序。
private mapping shield_definitions() {
    return ([
        "niupi_dun": ([
            "name": "牛皮盾",
            "ids": ({ "leather shield", "shield", "dun" }),
            "weight": 7000,
            "properties": ({
                ({ "material", "leather" }),
                ({ "unit", "面" }),
                ({ "value", 1200 }),
                ({ "armor_prop/armor", 5 }),
                ({ "armor_prop/defense", 3 }),
            }),
        ]),
    ]);
}
