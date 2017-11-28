#include <ansi.h>

inherit ITEM;

void setup()
{}

void create()
{
               set_name("铁哨", ({"tie shao","shao" }));
        
                set("unit", "个");
                set("long", "这是一个黑黝黝的铁哨子，看不出有什么不同。\n");
                set("value", 0);
              set("no_drop", "这样东西不能离开你。\n");
              set_weight(500);

        
        setup();
}

