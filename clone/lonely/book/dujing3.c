#include <ansi.h> 
inherit BOOK;

void create()
{
        set_name(NOR + WHT "「毒经下篇」" NOR, ({ "du jing3", "jing3", "book3" }));
        set_weight(500);
        if (clonep())
                destruct(this_object());
        else {
                set("unit", "本");
                set("long", WHT "这是一本薄薄的小册，上面记满了五毒教特"
                            "有的用毒的法门。\n" NOR);
                set("value", 100);
                set("no_sell", "我…我的天…连五毒教的东西你都敢拿来卖？");
                set("material", "silk");
                set("skill", ([
                        "name"         : "wudu-qishu",
                        "exp_required" : 150000,
                        "jing_cost"    : 50,
                        "difficulty"   : 50,
                        "min_skill"    : 50,
                        "max_skill"    : 149,
                ]));
        }
}
