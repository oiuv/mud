#include <ansi.h>
 
inherit BOOK;

void create()
{
        set_name(YEL "「苗家剑谱」上册" NOR, ({ "miaojia jianpu", "miaojia", "jianpu", "pu", "book" }));
        set_weight(500);
        if (clonep())
                destruct(this_object());
        else {
                set("unit", "本");
                set("long", YEL "这是一本薄薄的书册，书皮已然发黄，封"
                            "面上写着「苗家剑谱」四个字。\n" NOR);
                set("value", 1);
                set("no_sell", "…苗…苗家…金面佛他老人家我可得罪不起。");
                set("material", "paper");
                set("skill", ([
                        "name":       "suqin-beijian",
                        "exp_required" : 10000,
                        "jing_cost":  100,
                        "difficulty": 40,
                        "max_skill":  119,
                        "min_skill":  0
                ]));
        }
}
