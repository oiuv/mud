#include <ansi.h>
#include <command.h>

inherit F_CLEAN_UP;

int main(object me, string str)
{
        object ob, stone;
        int p, mp;

        if (! str)
                return notify_fail("你要熔炼什么物品？\n");

        if (me->is_busy())
                return notify_fail("先忙完了你的事情再做这件事情吧。\n");

        if (me->is_fighting())
                return notify_fail("你现在正在打架，没时间做这些事情。\n");

        if (! objectp(ob = present(str, me)))
                return notify_fail("你身上没有这件物品。\n");

        if (me->query_skill("force") < 300)
                return notify_fail("你的内功修为不够，难以熔炼物品。\n");

        if (me->query("max_neili") < 5000)
                return notify_fail("你的内力修为不够，难以熔炼物品。\n");

        if (me->query("neili") < 3000)
                return notify_fail("你现在的内力不足，难以熔炼物品。\n");

        if (! ob->query("can_make") || ! ob->query("item_origin"))
                return notify_fail("这东西似乎熔炼不出什么。\n");

        p = ob->query("power_point");

        message_vision(HIM "$N" HIM "将" + ob->name() +
                       HIM "握于掌中，默默运转内力，迫"
                       "使其熔化。\n" NOR, me);

        if (p < 50)
        {
                message_vision(HIR "突然却见" + ob->name() +
                               HIR "嗤的化作一股青烟，什么都"
                               "没有留下。\n" NOR, me);
                destruct(ob);
                return 1;
        }

        p = random(p * 3 / 2);

        if (p > 120)
                stone = new("/clone/fam/item/stone5");
        else if (p > 90)
                stone = new("/clone/fam/item/stone4");
        else if (p > 70)
                stone = new("/clone/fam/item/stone3");
        else if (p > 50)
                stone = new("/clone/fam/item/stone2");
        else
                stone = new("/clone/fam/item/stone1");

        message_vision(HIM "霎时只见$N" HIM "掌心白雾蒸腾，似乎发"
                       "生了什么不同寻常的事情。\n" NOR, me);

        if (stone->query("value"))
        {
                mp = stone->query("value") / 300;
                mp = 5 + random(mp);
                if (mp < 5) mp = 5;
                if (mp > 100) mp = 100;

                me->add("magic_points", mp);
                tell_object(me, HIC "你通过熔炼"+ stone->name() +
                                HIC "的过程，从而获得了" +
                                chinese_number(mp) + "点灵慧。\n" NOR);
        }
        me->add("max_neili", -1);
        me->add("neili", -3000);
        me->start_busy(5);

        stone->set_amount(1);
        stone->move(me, 1);
        destruct(ob);
        return 1;
}

int help(object me)
{
write(@HELP
指令格式：fuse <物品ID>

此指令可让你将某些物品熔化。一般来说能够铸造武器的原料都可以
被熔炼，不过熔炼物品需要比较高的内功等级和内力修为，每次成功
的熔炼都会增加一定数量的灵慧，但是会消耗一点最大内力。
HELP);
        return 1;
}

