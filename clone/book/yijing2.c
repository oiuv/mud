//yijing2.c
inherit BOOK;
inherit F_UNIQUE;
#include <ansi.h>
 
void create()
{
        set_name(HIY"「易经杂卦篇」"NOR, ({ "yijing zagua","yijing2", }));
        set_weight(500);
        if( clonep() )
                set_default_object(__FILE__);
        else {
                set("unit", "本");
                set("long",
        "这是一本用薄绢写成的书。上书：“易经杂卦篇”。\n"
        "书皮泛黄，看来已经保存很久了。\n",

        );
                set("value", 0);
                set("material", "silk");
                set("skill", ([
                        "name":       "qimen-wuxing",
                        "jing_cost":  40,
                        "difficulty": 30,
                        "max_skill":  75,
                        "min_skill":  50
                ]) );
        }
}
