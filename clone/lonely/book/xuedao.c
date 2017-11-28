#include <ansi.h>
 
inherit BOOK;

void create()
{
        set_name(HIR "「血刀经」" NOR, ({ "xuedao jing", "xuedao", "jing", "book" }));
        set_weight(500);
        if (clonep())
                destruct(this_object());
        else {
                set("unit", "本");
                set("long", HIR "这是一本薄薄的书册，封面上豁然写着「血"
                            "刀经」三个大字。\n" NOR);
                set("value", 1);
                set("no_sell", "血…血刀…经？这…该不会是血刀门的东西吧？");
                set("material", "paper");
                set("skill", ([
                        "name" : "xuedao-dafa",
                        "exp_required" : 300000,
                        "jing_cost"  : 100,
                        "difficulty" : 80,
                        "max_skill"  : 179,
                        "min_skill"  : 10
                ]));
        }
}
