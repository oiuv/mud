// qdel.c
// created by doing

#include <ansi.h>

inherit F_CLEAN_UP;

int main(object me, string arg)
{
        mapping total;
        object *obs, *dst;
        object qob;

	seteuid(getuid());

        if (! SECURITY_D->valid_grant(me, "(arch)"))
                return 0;

        if (! arg)
                return notify_fail("你要清除什么任务？\n");

        total = QUEST_D->query("information");
        if (! mapp(total))
                return notify_fail("当前系统没有任何任务。\n");

        obs = keys(total);
        obs = filter_array(obs, (: objectp($1) :));

        if (! sizeof(obs))
                return notify_fail("当前系统没有任何任务。\n");

        sscanf(arg, "%s %*s", arg);
        if (arg == "all" || arg == "ALL")
        {
                foreach (qob in obs)
                {
                        reset_eval_cost();
                        destruct(qob);
                }
                write("你清除了系统中所有的任务。\n");
                return 1;
        }

        qob = find_object(arg);
        if (! objectp(qob) || ! qob->is_quest())
        {
                obs = filter_array(obs, (: $1->name() == $(arg) :));
                if (! sizeof(obs))
                {
                        write("目前系统中不存在 " + arg +
                              " 这个任务。\n");
                        return 1;
                }
                qob = obs[0];
        }

        write("你清除了『" + qob->name() + "』这个任务。\n");
        destruct(qob);
        return 1;
}

int help(object me)
{
	write(@HELP
指令格式 : qdel all | <任务名称>

此指令可清除当前系统某一个任务或是所有的任务。
HELP
	);
	return 1;
}
