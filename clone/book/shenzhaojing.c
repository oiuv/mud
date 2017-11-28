// shenzhao-jing.c

#include <ansi.h>

inherit BOOK;

void create()
{
        set_name(MAG "神照经" NOR, ({ "shenzhao jing", "jing", "book"})); 
        set_weight(300);
        if (clonep())
                set_default_object(__FILE__);
        else {
                set("unit", "张");
                set("long", "这是一张很普通的纸，上面抄录了一些口诀，似乎是一"
                            "种叫做神照经\n的绝世武功诀窍。\n");
                set("material", "paper");
                set("skill", ([
                        "name"        :  "shenzhaojing",
                        "exp_required":  100000,
                        "jing_cost"   :  30,
                        "difficulty"  :  25,
                        "max_skill"   :  200,
                ]));
        }
}
