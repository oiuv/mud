// zhou.c

#include <ansi.h>

inherit ITEM;

void create()
{
        set_name("腊八粥", ({ "zhou"}));
        if (clonep())
                set_default_object(__FILE__);
        else {
                set("unit", "碗");
                set("long", "这是一碗珍贵的补品腊八粥。\n");
                set("value", 20000);
                set("only_do_effect", 1);
        }
        setup();
}

int do_effect(object me)
{
        int neili_limit;
        int neili;

        neili = me->query("max_neili");
        neili_limit = me->query_neili_limit();

        if (neili < neili_limit)
        {
                neili += random(50) + 1;
                if (neili >= neili_limit) neili = neili_limit;
                me->add("neili", 25 - random(50));
                message_vision(HIY "$N" HIY "吃下一碗腊八粥，顿然间"
                               "只觉一股热气直沁心肺...\n" NOR, me);
        } else
                message_vision(HIY "$N" HIY "吃下一碗腊八粥，不怎么甜，有点苦...\n" NOR,
                               me);

        destruct(this_object());
        return 1;
}
