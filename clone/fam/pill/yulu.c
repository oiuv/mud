#include <ansi.h>
inherit ITEM;

void create()
{
        set_name(HIG "天香玉露" NOR, ({ "tianxiang yulu", "tianxiang", "yulu" }));
        if (clonep())
                set_default_object(__FILE__);
        else {
                set("unit", "瓶");
                set("long", HIG "采自灵山，千年来以灵芝为母，不断的"
                            "吸取着日精月华。\n" NOR);
                set("value", 30000);
        }
        setup();
}

void init()
{
        add_action("do_drink", "drink");
}

int do_drink(string arg)
{
        object me = this_player();

        string mapsk;
        int na, un;
        mapping my = me->query_entire_dbase();

        na = query("name");
        un = query("unit");

        if (! arg || ! id(arg))
                return notify_fail("你要喝什么东西？\n");

        if (me->is_busy())
                return notify_fail("急什么，小心别噎着了。\n");

        if ((int)me->query_condition("pill_drug") > 0)
        {
                write("你觉得现在内息未定，经脉隐隐还能感到真气冲荡，不"
                      "敢贸然服食。\n");
                return 1;
        }

        me->apply_condition("pill_drug", 4000);

        message_vision(HIY "$N" HIY "喝下一" + un + na + HIY "，脸色一变，似"
                       "乎精神了许多。\n" NOR, me);

        mapsk = me->query_skill_mapped("dodge");

        if (me->can_improve_skill("dodge")
           || (stringp(mapsk) && me->can_improve_skill(mapsk)))
	{
        	if (me->can_improve_skill("dodge"))
                	me->improve_skill("dodge", 20000);

        	if (stringp(mapsk) && me->can_improve_skill(mapsk))
                	me->improve_skill(mapsk, 20000);

        	tell_object(me, HIG "你只觉浑身上下飘飘欲仙，便似获得了重生一般。\n" NOR);
	} else
        	tell_object(me, HIY "你感到灵台处一阵空明，精力得到了完全的补充。\n" NOR);

        me->improve_jingli(100 + random(101));

        if (me->query("jingli") < me->query("max_jingli"))
                my["jingli"]  = my["max_jingli"];

        me->start_busy(random(8) + 8);
        destruct(this_object());
        return 1;
}

int query_autoload()
{
        return 1;
}

