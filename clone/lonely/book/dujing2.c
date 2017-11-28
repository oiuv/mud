#include <ansi.h> 
inherit BOOK;

void create()
{
        set_name(YEL "「毒经中篇」" NOR, ({ "du jing2", "jing2", "book2" }));
        set_weight(500);
        if (clonep())
                destruct(this_object());
        else {
                set("unit", "本");
                set("long", YEL "这是一本薄薄的小册，上面密密麻麻的记满"
                            "了各种用毒的法门。\n" NOR);
                set("value", 100);
                set("no_sell", "我…我的天…连五毒教的东西你都敢拿来卖？");
                set("material", "silk");
                set("skill", ([
                        "name"         : "poison",
                        "exp_required" : 100000,
                        "jing_cost"    : 50,
                        "difficulty"   : 50,
                        "min_skill"    : 50,
                        "max_skill"    : 119,
                ]));
        }
}
