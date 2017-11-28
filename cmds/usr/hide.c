// hide.c 隐藏兵器

#include <ansi.h>
#include <command.h>

inherit F_CLEAN_UP;

int main(object me, string str)
{
	object ob;
	//int i;

	if (! str)
                return notify_fail("你要隐藏什么物品？\n");

        if (! stringp(me->query("can_summon/" + str)))
                return notify_fail("你不知道如何隐藏这个物品。\n");

        if (! objectp(ob = present(str, me)) &&
	    ! objectp(ob = present(str, environment(me))))
                return notify_fail("你身边没有这个物品。\n");

        if (! ob->hide_anywhere(me))
        {
                message_vision(HIM "$N" HIM "举着" + ob->name() +
                               HIM "，口中念念有词。\n然而"
                               "什么也没有发生 :)\n", me);
        }

	return 1;
}

int help(object me)
{
write(@HELP
指令格式 : hide <物品的ID>

此指令可让你隐藏某些物品，让它们暂时消失。
HELP
    );
    return 1;
}

