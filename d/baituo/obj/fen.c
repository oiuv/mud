#include <ansi.h> 
inherit ITEM;

void create()
{
        set_name(NOR + GRN "蛇胆粉" NOR, ({ "shedan fen", "shedan", "fen" }));
        if (clonep())
                set_default_object(__FILE__);
        else {
                set("unit", "包");
                set("long", GRN "这是一包治疗外伤的蛇胆粉。\n" NOR);
                set("value", 2000);
                set("only_do_effect", 1);
        }
        setup();
}

int do_effect(object me)
{
        if (me->query("eff_qi") >=  me->query("max_qi") - 20)
                return notify_fail("你现在气血充盈，不需要用蛇胆粉。\n");

        if (random(2) == 0)
        {
                message_vision(WHT "$N" WHT "吃下一包蛇胆粉，觉得"
                               "象是土豆粉，连呼上当。\n" NOR, me);
                destruct(this_object());
                return 1;
        }
        me->add("qi", 30);
        me->add("eff_qi", 20);
        message_vision(HIY "$N" HIY "吃下一包蛇胆粉，顿觉真气上涌"
                       "，精神好了些。\n" NOR, me);
        destruct(this_object());
        return 1;
}
