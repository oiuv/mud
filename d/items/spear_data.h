// 普通枪系长兵器的蓝图属性；按规范 ID 自然排序。
private mapping spear_definitions() {
    return ([
        "bintie_qiang": ([
            "name": HIW "镔铁长枪" NOR,
            "ids": ({ "chang qiang", "qiang", "spear" }),
            "weight": 15000,
            "damage": 10,
            "properties": ({
                ({ "unit", "支" }),
                ({ "value", 300 }),
                ({ "material", "silk" }),
            }),
        ]),
        "fangtian_ji": ([
            "name": HIR "方天画戟" NOR,
            "ids": ({ "fangtian huaji", "huaji", "ji" }),
            "weight": 15000,
            "damage": 75,
            "properties": ({
                ({ "unit", "杆" }),
                ({ "value", 500000 }),
                ({ "material", "steel" }),
                ({ "long", "一杆玄铁打制的方天画戟，传说是三国名将吕布所用过的武器。\n" }),
                ({ "wield_msg", "$N提起$n握在手中，威风凛凛。\n" }),
            }),
        ]),
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
        "sangu_cha": ([
            "name": "三股叉",
            "ids": ({ "sangu cha" }),
            "weight": 5000,
            "damage": 15,
            "properties": ({
                ({ "unit", "杆" }),
                ({ "long", "这是一杆三尖开刃的三股叉。\n" }),
                ({ "value", 1500 }),
                ({ "rigidity", 100 }),
                ({ "material", "steel" }),
                ({ "wield_msg", "$N掣出一杆$n握在手中。\n" }),
                ({ "unwield_msg", "$N将手中的$n反别身后。\n" }),
            }),
        ]),
    ]);
}
