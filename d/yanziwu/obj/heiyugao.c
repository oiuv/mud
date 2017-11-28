// heiyugao.c

#include <ansi.h>

inherit ITEM;

void create()
{
        set_name(HIC "黑玉断续膏" NOR, ({ "heiyugao" }));
        if (clonep())
                set_default_object(__FILE__);
        else {
                set("unit", "粒");
                set("long", "这是一粒千年极其难配制的的黑玉断续膏,据说能起死回生。\n");
                set("only_do_effect", 1);
        }

        setup();
}

int do_effect(object me)
{
        me->receive_curing("jing", 1000);
        me->receive_curing("qi", 2000);
        tell_object(me, HIG "你只觉一股热流在七经八脉中循环了一个周天，立刻神采奕奕了！\n" NOR);
        destruct(this_object());
        return 1;
}
