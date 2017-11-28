#include <ansi.h>
inherit ITEM;

void create()
{
        set_name(HIC "穿心莲" NOR, ({"chuanxin lian", "chuanxin", "lian"}));
        set("unit", "朵");
        set("long", HIC "这是一朵碧蓝色的莲花，含剧毒。\n" NOR);
        set("value", 10);
        set_weight(100);
        set("only_do_effect", 1);
        setup();
}

int do_effect(object me)
{
        message_vision("$N一仰脖，将穿心莲塞入了嘴中。\n", me);
        me->set_temp("die_reason", "吃了穿心莲去见黑白无常了");
        me->die();
        destruct(this_object());
        return 1;
}

