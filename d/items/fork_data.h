// 普通兵器的蓝图属性；按规范 ID 自然排序。
private mapping fork_definitions() {
    return ([
        "gangcha": ([
            "name": "钢叉",
            "ids": ({ "gangcha", "cha", "fork" }),
            "weight": 8000,
            "damage": 25,
            "properties": ({
                ({ "unit", "柄" }),
                ({ "value", 1000 }),
                ({ "material", "iron" }),
                ({ "long", "一柄锋利的钢叉。\n" }),
                ({ "wield_msg", "$N抄起一柄$n，还拿衣服擦了擦叉尖。\n" }),
            }),
        ]),
    ]);
}
