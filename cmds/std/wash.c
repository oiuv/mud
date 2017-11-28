// wash.c

#include <command.h>

inherit F_CLEAN_UP;

void create() { seteuid(getuid()); }

int main(object me, string arg)
{
        string target;
        object dest;
        string msg;
        int remain;

	if (!arg)
                return notify_fail("你要洗什么？\n");

        target = arg;

	if (! environment(me)->query("resource/water"))
		return notify_fail("这里没水，你怎么洗？\n");

        if (me->is_busy())
                return notify_fail("先忙玩了你的事情再洗吧！\n");

        if (me->is_fighting())
                return notify_fail("你还是打完了架再洗吧！\n");

        if (target == "hand" || target == "me")
        {
                // washing me
                dest = me;
        } else
        {
	        dest = present(target, me);
                if (! dest) dest = present(target, environment(me));
	        if (! dest)
                        return notify_fail("这里没有这样东西。\n");

                if (dest->is_character())
                {
                        if (dest != me)
                        {
                                dest->force_me("chat* rascal " + me->query("id"));
                                return notify_fail("你要给人家" + dest->name() +
                                                   "洗澡？\n");
                        }
                        // daub on me
                } else
        	if (! mapp(dest->query("armor_prop")) &&
                    ! mapp(dest->query("weapon_prop")))
                {
                        return notify_fail("那既不是武器，也不是防具，"
                                           "你有什么好清洗的？\n");
                }
        }

        if (remain = dest->query_temp("daub/poison/remain"))
        {
                if (remain > 10000)
                        msg = "，只见洗完的水变得腥臭无比，令人掩鼻。\n";
                else
                if (remain > 4000)
                        msg = "，就见那水忽的变了颜色，碧汪汪的，气味古怪。\n";
                else
                if (remain > 1000)
                        msg = "，清水随即色变，散发出一种难闻的气味。\n";
                else
                        msg = "，洗后水的颜色变得有点不对。\n";
        } else
                msg = "。\n";

        dest->delete_temp("daub");
        if (dest == me)
        {
                message_vision("$N好好的洗了洗手" + msg, me);
                return 1;
        }

        if (dest->query("equipped") == "worn")
        {
                function f;

                if (! REMOVE_CMD->do_remove(me, dest))
                        return 0;

                if (! dest || ! me)
                        return 1;

                message_vision("$N将脱下来的$n好好的洗了洗" + msg, me, dest);
                dest->washed(120 + random(120));
                return 1;
        }

        message_vision("$N拿出$n，好好的洗了洗" + msg, me, dest);
        return 1;
}

int help(object me)
{
write(@HELP
指令格式 : wash <武器> | <防具> | hand

这个指令可以让你将武器、防具好好冲洗一下，以清除上面的毒。当然没有
毒清洗它也不是什么坏事。
HELP
    );
    return 1;
}
