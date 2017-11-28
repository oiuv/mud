#include <ansi.h>
 
inherit BOOK;

void create()
{
        set_name(YEL "竹简" NOR, ({ "zhu jian", "zhu", "jian" }));
        set_weight(500);
        if (clonep())
                destruct(this_object());
        else {
                set("unit", "卷");
                set("long", YEL "一卷非常陈旧的竹简，系在上面的皮革都已断裂，竹"
                            "简上密密\n麻麻写满了小字，也不知是什么内容。\n" NOR);
                set("value", 1);
                set("no_sell", "快拿走，什么破玩意？");
                set("material", "bamboo");
                set("skill", ([
                        "name" : "zhuangzi-wu",
                        "exp_required" : 1500000,
                        "jing_cost"  : 120,
                        "difficulty" : 120,
                        "max_skill"  : 179,
                        "min_skill"  : 0,
                        "need" : ([ "muslim" : 250,
                                    "literate" : 250 ]),
                ]));
        }
}
