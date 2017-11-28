// miss 追寻物品

#include <ansi.h>
#include <command.h>

inherit F_CLEAN_UP;

int main(object me, string str)
{
	object ob;

	if (! str)
                return notify_fail("你要追寻什么物品？\n");

        if (! stringp(str = me->query("can_summon/" + str)))
                return notify_fail("你不知道如何追寻这个物品。\n");

	if (me->is_ghost())
		return notify_fail("等你还了阳再追寻吧。\n");

        if (me->is_busy() || me->is_fighting() || me->query("doing"))
                return notify_fail("等你忙完了再说吧！\n");

        if (! objectp(ob = find_object(str)) || ! environment(ob))
                return notify_fail("你穷尽精力，也无法感应到这个物品。\n");

        if (ob->query("magic/blood") < 3)
                return notify_fail("你与这个物品的融合度不够，无法追寻到这个物品！\n");

        ob->receive_miss(me);
	return 1;
}

int help(object me)
{
write(@HELP
指令格式 : miss <炼制物品的ID>

此指令可让你追寻你炼制的物品，必须有一定的精力才能做到。
HELP
    );
    return 1;
}
