#include <ansi.h>
inherit ITEM;
void create()
{
        set_name(HIR "龙胆" NOR, ({"long dan", "dan", "long"}));
        if (clonep())
                set_default_object(__FILE__);
        else {
                set("unit", "只");
                set("long", HIR "\n一只血淋淋的新鲜龙胆，从神兽青龙的身体里取出，可以入药。\n" NOR);
                set("value", 8000);
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

        message_vision(HIR "$N" HIR "生吞下一只血淋淋的龙胆，只感一股真气从体内澎湃而出。\n" NOR, me);
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
