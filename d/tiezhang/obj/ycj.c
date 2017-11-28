//ycj.c
//zqb
#include <ansi.h>
#include <weapon.h>
inherit SWORD;


void setup()
{}

void init()
{
        add_action("do_jian", "jian");
}

void create()
{
       set_name("鱼肠剑", ({"yuchang jian","jian"}) );
       set_weight(10000);
       
       if( clonep() )
               set_default_object(__FILE__);
       else{
       set("unit", "柄");
       set("long", "这就是传说中的鱼肠剑，没想到会在这里出现！\n"
                   "你忍不住想把它捡(jian)起来！！！\n");
       set("value",1000000);
       set("material", "steel");
       set("no_get",1);
       }
       init_sword(1000);
       setup();
}

int do_jian(string arg)
{
       
        object me = this_player();
        if (!id(arg))
                return 0;
       
                
                {
                message_vision(
HIR"$N轻轻地捡起鱼肠剑，突然从剑后射出一枚钢针，深深的刺入$N的体内。\n"NOR, this_player());
                me->unconcious();
         me->move("/d/tiezhang/shanlu-6");
                return 1;
        }
}


