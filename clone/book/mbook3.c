#include <ansi.h>
inherit BOOK;

void create()
{
        set_name(YEL "「华佗内昭图」" NOR, ({ "medical book3", "medical", "book3" }));
        set_weight(500);
        if (clonep())
                set_default_object(__FILE__);
        else {
                set("unit", "本");
                set("long", YEL "神医华佗所著的医书，内含许多医学秘要。\n" NOR);
                set("value", 30000);
                set("material", "paper");
                set("skill",
                ([
                        "name" : "medical",
                        "jing_cost"  : 45,
                        "difficulty" : 40,
                        "max_skill"  : 79,
                        "min_skill"  : 50,
                ]) );
        }
}
