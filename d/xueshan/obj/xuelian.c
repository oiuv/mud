// medicine: xuelian.c
// Jay 3/18/96

#include <ansi.h>

inherit ITEM;

void create()
{
        set_name("天山雪莲", ({"xuelian", "lian", "lotus"}));
        if (clonep())
                set_default_object(__FILE__);
        else {
                set("unit", "支");
                set("long", "这是一支只有在寒冷的地方才能生长的雪莲。\n");
                set("value", 100);
                set("only_do_effect", 1);
        }
        setup();
}

int do_effect(object me)
{
       if ((int)me->query("eff_qi") >= (int)me->query("max_qi"))
                return notify_fail("你现在不用吃这宝贝！\n");

       me->receive_curing("qi", 200);
       message_vision("$N小心地吃下一株雪莲，顿时觉得神清气爽了不少！\n",
                      me);

       destruct(this_object());
       return 1;
}
