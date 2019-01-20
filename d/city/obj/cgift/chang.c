#include <ansi.h>

inherit ITEM;

void create()
{
        set_name(HIM "圣诞烤肠" NOR, ({ "christmas chang", "chang", "christmas" }) );
        set_weight(300);
        if (clonep())
                set_default_object(__FILE__);
        else {
                set("long", HIW " 上面写着「" HIY "Merry Christmas！祝：圣诞快乐！" HIW"」。\n" NOR);
                set("value", 1);
                set("unit", "根");
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
              message_vision(HIY "$N" HIY "哈哈一笑，将整根烤肠一起吞了，但是没什么作用！\n" NOR, me);
              destruct(this_object());
              return 1;
        }
       	message_vision(HIY "$N" HIY "哈哈一笑，将整根烤肠一起吞了。\n" NOR, me);

        me->set("eat_christmas_gift/y2002", 1);
       	me->add("combat_exp", 50000);
       	me->add("potential", 10000);

       	mapsk = me->query_skill_mapped("parry");

       	if (me->can_improve_skill("parry"))
               	me->improve_skill("parry", 1500000);
       	if (stringp(mapsk) && me->can_improve_skill(mapsk))
               	me->improve_skill(mapsk, 1500000);

       	mapsk = me->query_skill_mapped("dodge");

       	if (me->can_improve_skill("dodge"))
               	me->improve_skill("dodge", 1500000);
       	if (stringp(mapsk) && me->can_improve_skill(mapsk))
               	me->improve_skill(mapsk, 1500000);

       	if (me->can_improve_skill("martial-cognize"))
               	me->improve_skill("martial-cognize", 1500000);

        message_vision(HIC "$N" HIC "你获得了五万点经验和一万点潜能。\n" NOR, me);

        destruct(this_object());
        return 1;
}