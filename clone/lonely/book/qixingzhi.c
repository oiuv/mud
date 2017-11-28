#include <ansi.h>
 
inherit BOOK;

void create()
{
        set_name(HIY "「七星指」" NOR, ({ "qixing zhi", "qixing", "zhi", "book" }));
        set_weight(500);
        if (clonep())
                destruct(this_object());
        else {
                set("unit", "本");
                set("long", YEL "这是一本薄薄的书册，书皮已然发黄，封"
                            "面上写着「七星指」三个字。\n" NOR);
                set("value", 1);
                set("no_sell", 1);
                set("material", "paper");
                set("skill", ([
                        "name":       "qixing-zhi",
                        "exp_required" : 100000,
                        "jing_cost":  60,
                        "difficulty": 50,
                        "max_skill":  1,
                        "min_skill":  0
                ]));
        }
}
