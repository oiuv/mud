// kill.c

#include <ansi.h>

inherit F_CLEAN_UP;

int main(object me, string arg)
{
        object obj;
        string /**killer,*/ callname;

	if (me->is_chatter())
		return 0;

        if (environment(me)->query("no_fight"))
                return notify_fail("这里不准战斗。\n");

        if (! arg)
                return notify_fail("你想杀谁？\n");

        if (! objectp(obj = present(arg, environment(me))))
                return notify_fail("这里没有这个人。\n");

        if (! obj->is_character() || obj->is_corpse())
                return notify_fail("看清楚一点，那并不是活物。\n");

        if (obj == me)
                return notify_fail("用 suicide 指令会比较快:)。\n");

        if (arrayp(me->query_team()) &&
            member_array(obj, me->query_team()) != -1)
                return notify_fail("连你自己队伍中的人也要杀吗？太不人道了吧！\n");

	if (me->is_fighting(obj) && me->is_killing(obj->query("id")))
		return notify_fail("你正在和人家生死相扑呢。\n");

        if ((int)obj->query_condition("die_guard"))
		return notify_fail("这个人正被官府保护着呢，还是别去招惹。\n");

        if (! me->is_fighting(obj) &&
            me->query("qi") < me->query("max_qi") * 3 / 10)
                return notify_fail("你现在没有力气战斗了。\n");

        callname = RANK_D->query_rude(obj);

        if (obj->query("can_speak"))
        {
        	if (! living(obj))
            		message_vision(HIR "\n$N" HIR "看了看晕倒在地的$n" HIR "，冷笑"
                                       "一声，喝道：" + callname + HIR  "，给我见阎王去"
                                       "吧！\n\n" NOR, me, obj);
            	else if (random(3) > 1)
            		message_vision(HIR "\n$N" HIR "对著$n" HIR "喝道：" + callname +
                                       HIR  "，今日不是你死就是我活！\n\n" NOR, me, obj);
            	else
            		message_vision(HIR "\n$N" HIR "对著$n" HIR "喝道：" + callname +
                                       HIR "，明年今日就是你的忌日！\n\n" NOR, me, obj);
        }

        switch(obj->accept_kill(me))
	{
	case 0:
                return (! objectp(obj));
	case -1:
		return 1;
	default:
	}

        if (userp(me) && userp(obj) && ! obj->is_want_kill(me->query("id")))
                me->want_kill(obj);

        me->kill_ob(obj);
        if (living(obj) && ! userp(obj))
                obj->kill_ob(me);
        else
                obj->fight_ob(me);

        return 1;
}

int help(object me)
{
        write(@HELP
指令格式 : kill <人物>
 
这个指令让你主动开始攻击一个人物，并且试图杀死对方，kill 和 fight 最大的
不同在於双方将会真刀实枪地打斗，也就是说，会真的受伤。由於 kill 只需单方
面一厢情愿就可以成立，因此你对任何人使用 kill 指令都会开始战斗，通常如果
对方是 NPC 的话，他们也会同样对你使用 kill。

当有人对你使用 kill 指令时会出现红色的字样警告你，对於一个玩家而言，如果
你没有对一名敌人使用过 kill 指令，就不会将对方真的打伤或杀死。

其他相关指令: hit, fight

HELP);
        return 1;
}