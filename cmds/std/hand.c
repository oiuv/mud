// drop.c

#include <weapon.h>

inherit F_CLEAN_UP;

int main(object me, string arg)
{
        object ob, old;
        object weapon;

	if (! arg)
                return notify_fail("你要拿出什么东西？\n");

        if (arg == "none" || arg == "nothing")
        {
                if (! objectp(ob = me->query_temp("handing")))
                        return notify_fail("你本来就什么都没有拿啊？\n");

                message_vision("$N把" + ob->name() + "收回包囊。\n", me);
                me->delete_temp("handing");
                return 1;
        }

	if (! objectp(ob = present(arg, me)))
		return notify_fail("你身上没有这样东西。\n");

        if (objectp(old = me->query_temp("handing")))
        {
                if (old == ob)
                        return notify_fail("你不是正拿着它吗？\n");

                message_vision("$N收回手中的" + old->name() + "。\n", me);
                me->delete_temp("handing");
        }

        if ((ob->query_amount() ? ob->query("base_weight") : ob->query_weight()) > 20000)
                return notify_fail(ob->name() + "太重了，你单手拿不住。\n");

        weapon = me->query_temp("weapon");
        if (weapon &&
            (((int)weapon->query("flag")) & TWO_HANDED ||
             me->query_temp("secondary_weapon")))
        {
                // none of two hand is free
                return notify_fail("你双手都拿着武器，没有办法"
                                   "再拿着" + ob->name() + "了。\n");
        }

        if (ob->query("equipped"))
                return notify_fail("你正装备着它呢！\n");

        me->set_temp("handing", ob);
        message_vision("$N拿出" + (old && ob->name() == old->name() ? "另外" : "") +
                        "一" + (ob->query_amount() ? ob->query("base_unit")
                                                   : ob->query("unit")) +
                        ob->name() + "，握在手中。\n", me);
        return 1;
}

int help(object me)
{
	write(@HELP
指令格式 : hand <物品名称> | nothing
 
这个指令可以让你拿出一样你所携带的物品，随时准备使用。
 
HELP );
    return 1;
}
 
