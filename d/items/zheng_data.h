// 普通乐器固定蓝图属性；规范 ID 自然排序，演奏复用原 MI 继承。
private mapping zheng_definitions() {
    return ([
        "guzheng": ([
            "name": NOR + YEL "古筝" NOR,
            "ids": ({ "gu zheng", "gu", "zheng" }),
            "weight": 300,
            "properties": ({
                ({ "unit", "台" }),
                ({ "long", YEL "这是一台看上去有些陈旧的古筝。\n" NOR }),
                ({ "value", 50 }),
                ({ "material", "wood" }),
            }),
        ]),
        "tiezheng": ([
            "name": NOR + WHT "铁筝" NOR,
            "ids": ({ "tie zheng", "tie", "zheng" }),
            "weight": 300,
            "properties": ({
                ({ "unit", "台" }),
                ({ "long", WHT "这是一台黑黝黝的铁筝。\n" NOR }),
                ({ "value", 5000 }),
                ({ "material", "steel" }),
            }),
        ]),
    ]);
}
