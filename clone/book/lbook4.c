#include <ansi.h>
inherit BOOK;

void create()
{
        set_name(YEL "「论语」" NOR, ({ "literate book4", "literate", "book4"}));
        set_weight(300);
        if (clonep())
                set_default_object(__FILE__);
        else {
            	set("unit", "本");
            	set("long", YEL "这是一本孔夫子的论语。\n" NOR);
            	set("value", 1000);
                set("no_sell", "这…这值什么钱？\n");
            	set("material", "paper");
            	set("skill", ([
                	"name": "literate",
                	"jing_cost"  : 55,
                	"difficulty" : 35,
                	"max_skill"  : 149,
                	"min_skill"  : 100,
            	]));
        }
}
