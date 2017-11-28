#include <ansi.h>
 
inherit BOOK;

void create()
{
        set_name(HIY "「峨嵋九阳功」" NOR, ({ "emei jiuyang", "emei", "jiuyang", "book" }));
        set_weight(500);
        if (clonep())
                destruct(this_object());
        else {
                set("unit", "本");
                set("long", HIG "这是一本薄薄的册子，书面已经有点开始腐烂。\n" NOR);
                set("value", 1);
                set("no_sell", "这本破书你自己留着吧。");
                set("material", "paper");
                set("skill", ([
                        "name"       : "emei-jiuyang",
                        "jing_cost"  : 100,
                        "difficulty" : 200,
                        "max_skill"  : 180,
                        "min_skill"  : 0
                ]));
        }
}
