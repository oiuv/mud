// 普通兵器的蓝图属性；按规范 ID 自然排序。
private mapping pin_definitions() {
    return ([
        "xiuhua_zhen": ([
            "name": "绣花针",
            "ids": ({ "xiuhua zhen", "zhen", "needle" }),
            "weight": 5,
            "damage": 10,
            "properties": ({
                ({ "unit", "根" }),
                ({ "long", "这是一根精钢细磨的绣花针，是绣花用的绝佳工具。\n" }),
                ({ "value", 80 }),
                ({ "material", "steel" }),
                ({ "wield_msg", "$N用拇指和食指从鬓间拈出一根$n。\n" }),
                ({ "unwield_msg", "$N将手中的$n插回鬓间。\n" }),
            }),
        ]),
    ]);
}
