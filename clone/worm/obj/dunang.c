#include <ansi.h>
inherit ITEM;

void create()
{
        set_name(HIG "毒囊" NOR, ({"du nang", "dunang", "du", "nang"}));
        set("unit", "个");
        set("long", HIG "这是一个毒虫的毒囊，囊中充满了毒液，发着磷光。\n" NOR);
        set("value", 100);
        set_weight(10);
        set("only_do_effect", 1);
        setup();
}

int do_effect(object me)
{
        message_vision("$N一仰脖，将毒囊的毒液尽数倒入嘴中。\n", me);
        me->set_temp("die_reason", "吃了毒囊去见黑白无常了");
        me->die();
        destruct(this_object());
        return 1;
}

