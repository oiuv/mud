#include <ansi.h>
 
inherit BOOK;

void create()
{
        set_name(GRN "竹简" NOR, ({ "zhu jian", "zhu", "jian" }));
        set_weight(500);
        if (clonep())
                destruct(this_object());
        else {
                set("unit", "卷");
                set("long", GRN "一卷非常陈旧的竹简，但保存得尚算完好，竹简上密"
                            "密麻麻写\n满了小字，也不知是什么内容。\n" NOR);
                set("value", 1);
                set("no_sell", "快拿走，什么破玩意？");
                set("material", "bamboo");
                set("skill", ([
                        "name" : "leiting-fu",
                        "exp_required" : 1000000,
                        "jing_cost"  : 100,
                        "difficulty" : 100,
                        "max_skill"  : 299,
                        "min_skill"  : 0,
                        "need" : ([ "muslim" : 200 ]),
                ]));
        }
}
