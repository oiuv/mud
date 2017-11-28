#include <ansi.h>
inherit ITEM;
void create()
{
        set_name(HIM "天霞神丹" NOR, ({"tianxia shendan", "dan"}));
        if (clonep())
                set_default_object(__FILE__);
        else {
                set("unit", "粒");
                set("value", 0);
                set("only_do_effect", 1);
        }
        setup();
}

int do_effect(object me)
{
        mapping my;

        my = me->query_entire_dbase();

        if( me->is_busy() )
                return notify_fail("急什么，小心别噎着了。\n");

        me->set_temp("last_eat/dan(full)", time());

        message_vision(HIY "$N" HIY "吃下一粒天霞神丹，再也感觉不到任何疲惫。\n" NOR, me);
        me->set("jingli",me->query("max_jingli"));
        me->set("neili",me->query("max_neili"));
        me->set("jing",me->query("max_jing"));
        me->set("qi",me->query("max_qi"));
        me->set("eff_jing",me->query("max_jing"));
        me->set("eff_qi",me->query("max_qi"));
        me->improve_skill("force", 200000000);

        me->start_busy(6);
        destruct(this_object());
        return 1;
}
