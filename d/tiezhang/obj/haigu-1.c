//haigu-1.c
//zqb
#include <ansi.h>

inherit ITEM;

void setup()
{}

void init()
{
        add_action("do_move", "move");
}

void create()
{
       set_name("骸骨", ({"haigu","skeleton"}) );
       set_weight(10000);
       set_max_encumbrance(6000000);
       if( clonep() )
               set_default_object(__FILE__);
       else{
       set("unit", "具");
       set("long", "这副骸骨躺在这里已经很久了。\n");
       set("value", 0);
       set("material","wood");
       set("no_get",1);
       set("init",0);
       }
       setup();
}

int do_move(string arg)
{
//      object book;
        object me = this_player();
        if (!id(arg))
                return 0;
       
                
                {
                message_vision(
HIR"$N轻轻地挪动骸骨，突然从骸骨的身后射出一枚钢针，刺入$N的体内。\n"NOR, this_player());
                me->unconcious();
                me->move("/u/zqb/tiezhang/shanlu-6");
                return 1;
        }
}

