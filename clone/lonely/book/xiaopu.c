#include <ansi.h>
 
inherit BOOK;

void create()
{
        set_name(HIG "「箫谱」" NOR, ({ "xiao pu", "xiao", "pu", "shu", "book" }));
        set_weight(500);
        if (clonep())
                destruct(this_object());
        else {
                set("unit", "本");
                set("long", HIG "这是一本薄薄的箫谱，记载了一些吹箫的方法。\n" NOR);
                set("value", 1);
                set("no_sell", "这本破书你自己留着吧。");
                set("material", "paper");
                set("skill", ([
                        "name"       : "chuixiao-jifa",
                        "jing_cost"  : 30,
                        "difficulty" : 30,
                        "max_skill"  : 149,
                        "min_skill"  : 0
                ]));
        }
}
