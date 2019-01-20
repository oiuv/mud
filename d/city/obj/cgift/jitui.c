#include <ansi.h>

inherit ITEM;

void create()
{
        set_name(HIY "圣诞鸡腿" NOR, ({ "christmas leg", "leg", "christmas" }) );
        set_weight(300);
        if (clonep())
                set_default_object(__FILE__);
        else {
                set("long", HIW " 上面写着「" HIY "Merry Christmas！祝：圣诞快乐！" HIW"」。\n" NOR);
                set("value", 1);
                set("unit", "块");
                set("only_do_effect", 1);
        }
}

int do_effect(object me)
{
        string mapsk;
        int effect;
//      int neili;

        effect = 0;

        if (me->query("eat_christmas_gift/y2002"))
        {
              message_vision(HIY "$N" HIY "哈哈一笑，将整个鸡腿一起吞了，但是没什么作用！\n" NOR, me);
              destruct(this_object());
              return 1;
        }
       	message_vision(HIY "$N" HIY "哈哈一笑，将整个鸡腿一起吞了。\n" NOR, me);

        me->set("eat_christmas_gift/y2002", 1);
       	me->add("combat_exp", 50000);
       	me->add("potential", 10000);

       	mapsk = me->query_skill_mapped("force");

       	if (me->can_improve_skill("force"))
               	me->improve_skill("force", 1500000);
       	if (stringp(mapsk) && me->can_improve_skill(mapsk))
               	me->improve_skill(mapsk, 1500000);

       	mapsk = me->query_skill_mapped("unarmed");

       	if (me->can_improve_skill("unarmed"))
               	me->improve_skill("unarmed", 1500000);
       	if (stringp(mapsk) && me->can_improve_skill(mapsk))
               	me->improve_skill(mapsk, 1500000);

       	if (me->can_improve_skill("martial-cognize"))
               	me->improve_skill("martial-cognize", 1500000);

        message_vision(HIC "$N" HIC "你获得了五万点经验和一万点潜能。\n" NOR, me);

        destruct(this_object());
        return 1;
}