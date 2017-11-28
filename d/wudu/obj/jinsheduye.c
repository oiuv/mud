#include <ansi.h>
inherit ITEM;

void create()
{
        set_name(YEL "金蛇毒液" NOR, ({"jinshe duye", "jinshe", "duye"}));
        set("unit", "瓶");
        set("long", YEL "这是一瓶剧毒的金蛇毒液。\n" NOR);
        set("value", 100);
        set_weight(100);
        set("only_do_effect", 1);
        setup();
}

int do_effect(object me)
{
        message_vision("$N一仰脖，把金蛇毒液倒入了嘴中。\n", me);
        me->set_temp("die_reason", "喝了金蛇毒液去见黑白无常了");
        me->die();
        destruct(this_object());
        return 1;
}

