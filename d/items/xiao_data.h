// 普通乐器固定蓝图属性；规范 ID 自然排序，演奏复用原 MI 继承。
private mapping xiao_definitions() {
    return ([
        "liuquan_xiao": ([
            "name": HIG "碧玉洞萧·流泉" NOR,
            "ids": ({ "liuquan xiao", "liuquan", "xiao" }),
            "weight": 600,
            "properties": ({
                ({ "unit", "把" }),
                ({ "long", HIG "一把碧玉所制的洞萧，隐隐泛出绿"
                    "光。上刻「" HIC "流泉" HIG "」。\n" NOR }),
                ({ "value", 5000000 }),
                ({ "material", "stone" }),
            }),
        ]),
        "qingyin_xiao": ([
            "name": HIG "碧玉洞萧·清音" NOR,
            "ids": ({ "qingyin xiao", "qingyin", "xiao" }),
            "weight": 600,
            "properties": ({
                ({ "unit", "把" }),
                ({ "long", HIG "一把碧玉所制的洞萧，隐隐泛出绿"
                    "光。上刻「" HIB "清音" HIG "」。\n" NOR }),
                ({ "value", 5000000 }),
                ({ "material", "stone" }),
            }),
        ]),
        "shuiyun_xiao": ([
            "name": HIG "碧玉洞萧·水云" NOR,
            "ids": ({ "shuiyun xiao", "shuiyun", "xiao" }),
            "weight": 600,
            "properties": ({
                ({ "unit", "把" }),
                ({ "long", HIG "一把碧玉所制的洞萧，隐隐泛出绿"
                    "光。上刻「" HIW "水云" HIG "」。\n" NOR }),
                ({ "value", 5000000 }),
                ({ "material", "stone" }),
            }),
        ]),
        "youlan_xiao": ([
            "name": HIG "碧玉洞萧·幽兰" NOR,
            "ids": ({ "youlan xiao", "youlan", "xiao" }),
            "weight": 600,
            "properties": ({
                ({ "unit", "把" }),
                ({ "long", HIG "一把碧玉所制的洞萧，隐隐泛出绿"
                    "光。上刻「" HIM "幽兰" HIG "」。\n" NOR }),
                ({ "value", 5000000 }),
                ({ "material", "stone" }),
            }),
        ]),
        "zhuxiao": ([
            "name": NOR + GRN "翠竹萧" NOR,
            "ids": ({ "zhu xiao", "zhu", "xiao" }),
            "weight": 600,
            "properties": ({
                ({ "unit", "把" }),
                ({ "long", GRN "一把翠竹所制的洞萧，隐隐泛出绿光。\n" NOR }),
                ({ "value", 50 }),
                ({ "material", "bamboo" }),
            }),
        ]),
        "zhuxiao2": ([
            "name": GRN "普通竹萧" NOR,
            "ids": ({ "zhu xiao", "zhu", "xiao" }),
            "weight": 600,
            "properties": ({
                ({ "unit", "把" }),
                ({ "long", GRN "一把翠竹所制的洞萧，非常普通。\n" NOR }),
                ({ "value", 200 }),
                ({ "material", "bamboo" }),
            }),
        ]),
        "zhuxiao3": ([
            "name": "竹萧",
            "ids": ({ "zhuxiao" }),
            "weight": 300,
            "properties": ({
                ({ "unit", "根" }),
                ({ "long", "一根普普通通的竹萧，但是也能吹出动人的曲子。\n" }),
                ({ "value", 10 }),
                ({ "material", "bamboo" }),
            }),
        ]),
    ]);
}
