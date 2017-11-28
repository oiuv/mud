// jiuzhang.c

#include <ansi.h>
 
inherit BOOK;

void create()
{
        set_name(HIY "「九章算术」" NOR, ({ "jiuzhang", "shu" }));
        set_weight(500);
        if (clonep())
                set_default_object(__FILE__);
        else {
                set("unit", "本");
                set("long", "这是一本薄薄的小册子，上面写着"
                            "“九章算术”四个古篆小字。\n");
                set("value", 0);
                set("material", "paper");
                set("skill", ([
                        "name":       "mathematics",
                        "jing_cost":  100,
                        "difficulty": 30,
                        "max_skill":  149,
                        "min_skill":  80
                ]));
        }
}
