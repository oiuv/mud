// guigu.c 鬼谷神算

#include <ansi.h>

inherit BOOK;

void create()
{
        set_name(WHT "鬼谷神算" NOR, ({ "guigu book", "book", "shu" }));
        set_weight(300);

        if (clonep())
                set_default_object(__FILE__);
        else
        {
                set("unit", "本");
                set("long", "传说是当年鬼谷子所著的奇书。\n");
                set("value", 100);
                set("no_sell", "这...这值什么钱？\n");
                set("material", "silk");
                set("skill", ([
                        "name": "mathematics", // name of the skill
                        "jing_cost":   180,    // jing cost every time study this
                        "difficulty":   38,    // the base int to learn this skill
                        "max_skill":   300,    // the maximum level you can learn to
                        "min_skill":   150,    // minimun level required
                ]));
        }
}
