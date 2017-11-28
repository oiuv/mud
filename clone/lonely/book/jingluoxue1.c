#include <ansi.h>
 
inherit BOOK;

void create()
{
        set_name(HIY "「王叔和脉经」" NOR, ({ "mai jing", "mai", "jing", "book" }));
        set_weight(500);
        if (clonep())
                destruct(this_object());
        else {
                set("unit", "本");
                set("long", HIY "这是一本精装书册，书页已然发黄，书"
                            "皮上写着「王叔和脉经」五个字。\n" NOR);
                set("value", 1);
                set("no_sell", "奶奶的，这本破书也能卖钱？");
                set("material", "paper");
                set("skill", ([
                        "name" : "jingluo-xue",
                        "exp_required" : 10000,
                        "jing_cost"  : 80,
                        "difficulty" : 50,
                        "max_skill"  : 149,
                        "min_skill"  : 0
                ]));
        }
}
