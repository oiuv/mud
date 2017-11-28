#include <ansi.h>

inherit BOOK;

void create()
{
        set_name(WHT "「孟子」" NOR, ({ "mengzi book", "shu", "mengzi", "book" }));
        set_weight(300);

        if (clonep())
                set_default_object(__FILE__);
        else
        {
                set("unit", "本");
                set("long", WHT "这本书记载了当年孟子许多言行哲论，是儒家经典书籍。\n" NOR);
                set("value", 100);
                set("no_sell", "这…这值什么钱？\n");
                set("material", "paper");
                set("skill", ([
                        "name" : "literate",
                        "jing_cost"  :   100,
                        "difficulty" :   50,
                        "max_skill"  :   299,
                        "min_skill"  :   200,
                ]));
        }
}
