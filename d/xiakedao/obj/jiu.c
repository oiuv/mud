inherit ITEM;
#include <ansi.h>

void init()
{
        add_action("do_drink", "drink");
}

void create()
{
        set_name(HIC "玄" HIW "冰" HIC "碧" HIR "火"
                 HIC "酒" NOR, ({ "xuanbing jiu", "xuanbing", "jiu" }));
        if (clonep())
                set_default_object(__FILE__);
        else {
                set("unit", "壶");
                set("long", HIC "这是一壶珍贵之极的玄冰碧火酒。\n" NOR);
                set("value", 50000);
        }
        setup();
}

int do_drink(string arg)
{
        object me = this_player();

        if (! arg || ! id(arg))
                return notify_fail("你要喝什么东西？\n");

        if (me->is_busy())
                return notify_fail("急什么，小心别噎着了。\n");

        message_vision(HIC "$N" HIC "一仰头，将整瓶" + name() +
                       HIC "喝了下去。\n" NOR, me);

        if (! me->query("skybook/item/xuanbingjiu"))
        {
                message_vision(HIB "突然间$N" HIB "脸色忽的一变，冷不丁打"
                               "了几个寒战。\n" NOR, me);
                me->apply_condition("xuanbing-jiu", 50 + random(50));

        } else
        {
                message_vision(HIW "$N" HIW "一声长吁，体内阴阳真气相互交"
                               "替，白雾蒸腾而起。\n" NOR, me);

                if (me->can_improve_skill("force"))
                        me->improve_skill("force", 100000);

                if (me->query_skill_mapped("force") == "luohan-fumogong"
                   && me->can_improve_skill("luohan-fumogong"))
                        me->improve_skill("luohan-fumogong", 100000);

                me->add("skybook/item/xuanbingjiu", 1);

                me->start_busy(6);
        }
        destruct(this_object());
        return 1;
}
