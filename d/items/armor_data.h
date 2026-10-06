// 普通防具的蓝图属性；按规范 ID 自然排序。
private mapping armor_definitions() {
    return ([
        "jinhuan_jia": ([
            "name": HIY "金环锁子甲" NOR,
            "ids": ({ "jinhuan jia", "jinhuan", "jia", "armor" }),
            "weight": 20000,
            "properties": ({
                ({ "unit", "件" }),
                ({ "long", HIC "一件金线织就的宝甲．\n" NOR }),
                ({ "material", "steel" }),
                ({ "value", 400000 }),
                ({ "armor_prop/armor", 30 }),
                ({ "armor_prop/dodge", -5 }),
            }),
        ]),
        "pangu_kai": ([
            "name": WHT "盘古铠" NOR,
            "ids": ({ "pangu kai", "kai", "armor" }),
            "weight": 10000,
            "properties": ({
                ({ "unit", "件" }),
                ({ "long", "一件黑黝黝的铁甲，上面雕有盘古的头像。\n" }),
                ({ "value", 100000 }),
                ({ "material", "cloth" }),
                ({ "armor_prop/armor", 200 }),
            }),
        ]),
        "pi_beixin": ([
            "name": "皮背心",
            "ids": ({ "pi beixin", "beixin" }),
            "weight": 1000,
            "properties": ({
                ({ "unit", "件" }),
                ({ "value", 1000 }),
                ({ "material", "leather" }),
                ({ "armor_prop/armor", 6 }),
            }),
        ]),
        "ruanwei_jia": ([
            "name": "软猬甲",
            "ids": ({ "ruanwei jia", "jia" }),
            "weight": 1000,
            "properties": ({
                ({ "unit", "件" }),
                ({ "long", "一件轻飘飘的、生满尖锐倒刺的护甲。\n" }),
                ({ "material", "copper" }),
                ({ "value", 20000 }),
                ({ "armor_prop/armor", 75 }),
                ({ "armor_prop/dodge", -5 }),
            }),
        ]),
        "tiejia": ([
            "name": "铁甲",
            "ids": ({ "tie jia", "tiejia", "jia", "armor", "body" }),
            "weight": 4000,
            "properties": ({
                ({ "unit", "件" }),
                ({ "long", "一件沉甸甸的铁甲。\n" }),
                ({ "value", 0 }),
                ({ "material", "steel" }),
                ({ "armor_prop/armor", 30 }),
                ({ "armor_prop/dodge", -10 }),
            }),
        ]),
    ]);
}
