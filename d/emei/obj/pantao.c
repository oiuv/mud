#include <ansi.h>
inherit ITEM;

void create()
{
  	set_name(HIR "蟠桃" NOR, ({"pan tao", "pan", "tao"}));
  	set_weight(150);
  	if (clonep())
    		set_default_object(__FILE__);
  	else {
    		set("long", HIR "一个火红色的大蟠桃，正散发着扑鼻的清香。\n" NOR);
    		set("value", 3000);
                set("only_do_effect", 1);
    		set("unit", "个");
  	}
  	setup();
}

int do_effect(object me)
{
        string force;
        int neili_limit;

        neili_limit = me->query_neili_limit();

        message_vision(HIR "\n$N" HIR "三两口将手中的蟠桃嚼烂吞下，一张脸顿时胀"
                       "得通红。\n\n" NOR, me);
        me->start_busy(random(5) + 5);

  	if (me->query("max_neili") < neili_limit)
       	{
               	me->add("max_neili", 30 + random(30));
               	if (me->query("max_neili") > neili_limit)
                       	me->set("max_neili", neili_limit);
               	me->set("neili", me->query("max_neili"));
       	}
        force = me->query_skill_mapped("force");
       	if (me->can_improve_skill("force"))
               	me->improve_skill("force", 10000);
       	if (stringp(force) && me->can_improve_skill(force))
               	me->improve_skill(force, 10000);

        destruct(this_object());
        return 1;
}

