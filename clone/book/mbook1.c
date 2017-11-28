#include <ansi.h>
inherit BOOK;

void create()
{
        set_name(YEL "「本草纲目」" NOR, ({ "medical book1", "medical", "book1" }));
        set_weight(500);
        if (clonep())
                set_default_object(__FILE__);
        else {
                set("unit", "本");
                set("long", YEL "本草纲目乃是民间流传甚广的医书。\n" NOR);
                set("value", 8000);
                set("material", "paper");
                set("skill",
                ([
                        "name" : "medical",
                        "jing_cost"  : 15,
                        "difficulty" : 20,
                        "max_skill"  : 29,
                        "min_skill"  : 0,
                ]) );
        }
}
