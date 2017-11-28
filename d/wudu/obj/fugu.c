#include <ansi.h>
inherit ITEM;

void create()
{
        set_name(WHT "腐骨草" NOR, ({"fugu cao", "fugu", "cao"}));
        set("unit", "株");
        set("long", WHT "这是一株普通的小草，叶面发出一股难闻的臭气。\n" NOR);
        set("value", 10);
        set_weight(100);
        set("only_do_effect", 1);
        setup();
}

int do_effect(object me)
{
        message_vision("$N一仰脖，将腐骨草塞入了嘴中。\n", me);
        me->set_temp("die_reason", "吃了腐骨草去见黑白无常了");
        me->die();
        destruct(this_object());
        return 1;
}

