#include <ansi.h>
 
inherit BOOK;

void create()
{
        set_name(HIW "「玉颧神脉经」" NOR, ({ "yuquan jing", "yuquan", "jing", "book" }));
        set_weight(500);
        if (clonep())
                destruct(this_object());
        else {
                set("unit", "本");
                set("long", HIW "这是一本精装书册，书页已然发黄，书"
                            "皮上写着「玉颧神脉经」五个字。\n" NOR);
                set("value", 1);
                set("no_sell", "奶奶的，这本破书也能卖钱？");
                set("material", "paper");
                set("skill", ([
                        "name" : "jingluo-xue",
                        "exp_required" : 600000,
                        "jing_cost"  : 90,
                        "difficulty" : 65,
                        "max_skill"  : 200,
                        "min_skill"  : 149
                ]));
        }
}
