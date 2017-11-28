#include <ansi.h>
 
inherit BOOK;

void create()
{
        set_name(HIY "「旋风扫叶腿法」" NOR, ({ "xuanfeng paper", "xuanfeng", "paper", "shu", "book" }));
        set_weight(500);
        if (clonep())
                destruct(this_object());
        else {
                set("unit", "本");
                set("long", HIY "这是两张纸片，上面写的都是练功的口诀要旨，却是\n"
                            "黄药师的亲笔，字迹遒劲挺拔，第一叶上右首写着题\n目，"
                            "是「旋风扫叶腿法」六字。\n" NOR);
                set("value", 1);
                set("no_sell", "这本破书你自己留着吧。");
                set("material", "paper");
                set("skill", ([
                        "name"       : "xuanfeng-tui",
                        "jing_cost"  : 100,
                        "difficulty" : 30,
                        "max_skill"  : 119,
                        "min_skill"  : 0
                ]));
        }
}
