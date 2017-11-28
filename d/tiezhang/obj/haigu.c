#include <ansi.h>

inherit ITEM;
#include <ansi.h>
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
        object book;
        object me = this_player();
        if (!id(arg))
                return 0;
        if (this_player()->query_temp("wumu_shanshui") ) {
                if (!present("wumu yishu",me)){
                message_vision(
HIY"$N轻轻地挪动骸骨，发现下面有一本书，$N急忙拣起揣到怀中。\n"NOR
RED"那骸骨突然迎头向$N扑将下来，摔在地上，四下散开，吓了$N一跳！\n"NOR,this_player());
                book = new(__DIR__"wumu-yishu");
                book->move(me);
                destruct(this_object());
                return 1;
                }
                message_vision(
HIM"骸骨急道：书都拿到了还不快滚，没事把老子挪来挪去的干什么？？？\n"NOR, this_player());
                return 1;
                }
                else {
                message_vision(
HIR"$N轻轻地挪动骸骨，突然从骸骨的下面冒出一股毒气，钻进$N的鼻子中。\n"NOR, this_player());
		me->set_temp("last_damage_from", "中毒");
                me->die();
                return 1;
        }
}
