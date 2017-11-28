#include <ansi.h>
inherit ITEM;
void create()
{
        set_name(WHT "虎骨" NOR, ({"hu gu", "hu", "gu"}));
        if (clonep())
                set_default_object(__FILE__);
        else {
                set("unit", "根");
                set("long", WHT "\n一根新鲜的虎骨，从神兽白虎的身体里取出，可以入药。\n" NOR);
                set("value", 6000);
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

        message_vision(HIR "$N" HIR "将虎骨嚼烂吞下，只感一股真气直冲顶门。\n" NOR, me);
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
