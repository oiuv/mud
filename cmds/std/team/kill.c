// team command: kill

#include <ansi.h>

void create() { seteuid(getuid()); }

int main(object me, string arg)
{
        object env;
        object obj;
        object tob;
        object *t;

        // team kill 命令使用的标志
        int kill_flag;
        int want_kill_flag;

        t = me->query_team();
        if (! arrayp(t))
                return notify_fail("你这个队伍中现在"
                                   "没有别人，想出手就直接下KILL命令吧。\n");

        if (! me->is_team_leader())
                return notify_fail("只有队伍的领袖才能下命令攻击别人。\n");

        if (! arg)
                return notify_fail("你想率领队伍攻击谁？\n");

        env = environment(me);
        t = filter_array(t, (: objectp($1) && living($1) &&
                               environment($1) == $(env) :));
        if (! sizeof(t))
                return notify_fail("你这个队伍中现在"
                                   "没有人能够听你的号令，还是靠自己吧。\n");

        if (env->query("no_fight"))
                return notify_fail("这里不能战斗。\n");

        if (! objectp(obj = present(arg, env)))
                return notify_fail("你想攻击谁？\n");

        if (! obj->is_character() || obj->is_corpse())
                return notify_fail("看清楚了，那不是活人！\n");

        if (obj == me)
                return notify_fail("什么？你要自杀也不要叫上这么多人啊！\n");

        if (member_array(obj, me->query_team()) != -1)
                return notify_fail("你想攻击队伍中的人？好像没人会听你的话。\n");

        if (obj->query("can_speak"))
        {
                if (random(3) > 1)
                        message_vision("\n$N大声喊道：“大家上啊，对付" + obj->name() +
                                       "这种人不必讲究什么江湖道义！”\n\n",
                                       me, obj);
                else
                        message_vision("\n$N扯着嗓子喊道：“大家并肩"
                                       "子上啊！一起除掉" + obj->name() +
                                       "这" + RANK_D->query_rude(obj) +
                                       "！”\n\n", me, obj);
        } else
                message_vision("\n$N一挥手，喝道：“灭了这畜生！”\n\n",
                               me, obj);

        switch (obj->accept_kill(me))
	{
	case 0:
                return (! objectp(obj));
	case -1:
                if (objectp(obj) &&
                    ! me->is_killing(obj->query("id")))
                {
                        // 因为某种原因战斗没有发生
		        return 1;
                }
	default:
	}

        // 战斗已经发生，队伍中所有的人参与战斗
        message("vision", HIR "你和大家一起跟着" + me->name(1) +
                          HIR "冲了上去，围着" + obj->name() +
                          "就是一顿乱砍。\n" NOR, t, ({ me }));

        // 判断是否是我先主动想杀死对方
        if (userp(me) && userp(obj))
        {
                // 对方想杀害的人和我们对我中的成员
                string *obj_wants;
                object *all_team;

                // 重新取队伍的人员 - 因为队伍中晕倒的成员
                // 没有包含在 t 数组中。
                all_team = me->query_team();
                all_team -= ({ 0 });
                obj_wants = obj->query_want() - ({ 0 });
                if (sizeof(obj_wants - t->query("id")) != sizeof(obj_wants))
                {
                        // 对方想杀害我们对我中的某一些人，
                        // 因此认为是对方想杀害我们，否则
                        // 反之
                        want_kill_flag = 0;
                } else
                {
                        me->want_kill(obj);
                        want_kill_flag = 1;
                }
        }

        // 判断对方是否会杀死我
        if (living(obj) && ! userp(obj))
        {
                // 对方会杀死我们
                obj->kill_ob(me);
                kill_flag = 1;
        } else
        {
                // 对方不会杀死我们，只是攻击我们
                obj->fight_ob(me);
                kill_flag = 0;
        }

        // 驱动队伍中所有的人
        foreach (tob in t)
        {
                // 杀人方向和队长保持一致：如果对方
                // 主动攻击队伍中的某一个人，则设置
                // 是对方挑衅
                if (want_kill_flag)
                        tob->want_kill(obj);

                tob->kill_ob(obj);

                // 设置对手的攻击状态和队长保持一致
                if (kill_flag)
                        obj->kill_ob(tob);
                else
                        obj->fight_ob(tob);
        }

        return 1;
}
