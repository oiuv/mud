#include <ansi.h>
inherit BOOK;

void create()
{
        set_name(WHT "「九阴真经」拓本" NOR, ({ "zhenjing taben", "taben",
                                                "zhenjing", "jing" }));
        set_weight(500);
        if (clonep())
                set_default_object(__FILE__);
        else {
                set("unit", "张");
                set("no_sell", "你想钱想疯了？这也拿来卖钱？");
                set("long", WHT "这是一张拓片，上面拓满了密密麻麻的小字。\n" NOR);
                set("material", "paper");
                set("skill", ([
                        "name":        "force",
                        "exp_required" : 100000,
                        "jing_cost"    : 80,
                        "difficulty"   : 50,
                        "max_skill"    : 199,
                        "min_skill"    : 100
                ]));
        }
}
