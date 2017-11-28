#include <ansi.h>
inherit BOOK;

void create()
{
        set_name(YEL "「百家姓」" NOR, ({ "literate book2", "literate", "book2" }));
        set_weight(500);
        if( clonep() )
                set_default_object(__FILE__);                                   
        else
        { 
               set("unit", "本");
                set("long", YEL "读书人必读的百家姓。\n" NOR);
                set("value", 5000);
                set("material", "paper");
                set("skill",
                ([
                        "name": "literate",
                        "jing_cost":    25,
                        "difficulty":   20,
                        "max_skill":    49,
                        "min_skill":    30,
                ]) );
        }
}
