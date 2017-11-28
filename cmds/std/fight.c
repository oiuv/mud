// fight.c

#include <ansi.h>

inherit F_CLEAN_UP;

int main(object me, string arg)
{
        object obj, old_target;

	if (me->is_chatter())
		return 0;

        if (environment(me)->query("no_fight"))
                return notify_fail("这里禁止战斗。\n");

        if (!arg || !objectp(obj = present(arg, environment(me))))
                return notify_fail("你想攻击谁？\n");

        if (! obj->is_character())
                return notify_fail("看清楚一点，那并不是生物。\n");

        if (obj->is_fighting(me))
                return notify_fail("加油！加油！加油！\n");

        if (! living(obj))
                return notify_fail(obj->name() + "已经无法战斗了。\n"); 

        if (me->query("qi") < me->query("max_qi") * 3 / 10)
                return notify_fail("你现在没有力气战斗了。\n");

        if (obj == me) return notify_fail("你不能攻击自己。\n");

        if (obj->query("can_speak"))
	{
                message_vision("\n$N对著$n说道：" 
                        + RANK_D->query_self(me)
                        + me->name() + "，领教"
                        + RANK_D->query_respect(obj) + "的高招！\n\n", me, obj);

		if( objectp(old_target = me->query_temp("pending/fight")) )
			tell_object(old_target, YEL + me->name() + "取消了和你比试的念头。\n" NOR);
		me->set_temp("pending/fight", obj);

                notify_fail("看起来" + obj->name() + "并不想跟你较量。\n");
                switch (obj->accept_fight(me))
                {
		case 0:
                        return userp(obj);
		case -1:
			return 1;
		default:
                }

                me->fight_ob(obj);
                obj->fight_ob(me);
        } else
	{
                message_vision("\n$N大喝一声，开始对$n发动攻击！\n\n", me, obj);
                me->fight_ob(obj);
                obj->kill_ob(me);
        }

        return 1;
}
int help(object me)
{
  write(@HELP
指令格式 : fight <人物>
 
这个指令让你向一个人物「讨教」或者是「切磋武艺」，这种形式的战斗纯粹是
点到为止，因此只会消耗体力，不会真的受伤，但是并不是所有的  NPC 都喜欢
打架，因此有需多状况你的比武要求会被拒绝。
 
其他相关指令: kill

PS. 如果对方不愿意接受你的挑战，你仍然可以迳行用 kill 指令开始战斗，有
    关 fight 跟 kill 的区分请看 'help combat'.
HELP
    );
    return 1;
}

 

