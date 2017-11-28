#include <ansi.h>
inherit ITEM;

void create()
{
        set_name(GRN "断肠草" NOR, ({"duanchang cao", "duanchang", "cao"}));
        set("unit", "株");
        set("long", GRN "这是一株闪烁着磷光的小草。\n" NOR);
        set("value", 10);
        set_weight(100);
        set("only_do_effect", 1);
        setup();
}

int do_effect(object me)
{
        message_vision("$N一仰脖，将断肠草塞入了嘴中。\n", me);
        me->set_temp("die_reason", "吃了断肠草去见黑白无常了");
        me->die();
        destruct(this_object());
        return 1;
}

