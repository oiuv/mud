#include <ansi.h>
 
inherit BOOK;

void create()
{
        set_name(HIR "「多罗叶指」" NOR, ({ "duoluoye zhi", "duoluoye", "zhi", "book" }));
        set_weight(500);
        if (clonep())
                destruct(this_object());
        else {
                set("unit", "本");
                set("long", HIY "这是一本薄薄的书册，书皮看上去很新，像是"
                            "重新抄写的，封面上写着「多罗叶指」四个字。\n" NOR);
                set("value", 1);
                set("no_sell", 1);
                set("material", "paper");
                set("skill", ([
                        "name":       "duoluoye-zhi",
                        "exp_required" : 100000,
                        "jing_cost":  60,
                        "difficulty": 50,
                        "max_skill":  1,
                        "min_skill":  0
                ]));
        }
}
