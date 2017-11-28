// qinfo.c
// created by doing

#include <ansi.h>

inherit F_CLEAN_UP;

string time_len(int n)
{
        return sprintf("%.2d:%.2d:%.2d", n / 3600, (n % 3600) / 60, n % 60);
}

int main(object me, string arg)
{
        mapping total;
        object *obs;
        object qob;
        string str;

	seteuid(getuid());

        if (! SECURITY_D->valid_grant(me, "(arch)"))
                return 0;

        total = QUEST_D->query("information");
        if (! mapp(total))
                return notify_fail("当前系统没有任何任务。\n");

        obs = keys(total);
        obs = filter_array(obs, (: objectp($1) :));

        if (! sizeof(obs))
                return notify_fail("当前系统没有任何任务。\n");

        if (arg == "-n")
        {
                write(NOR + WHT "目前系统中共有 " + HIC + sizeof(obs) + NOR + WHT + " 个任务。\n");
                return 1;
        }

        if (arg)
        {
                sscanf(arg, "%s %*s", arg);
                qob = find_object(arg);
                if (! objectp(qob) || member_array(qob, obs) == -1)
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

                write(sprintf("有关任务 " + qob->name() + " 的情报信息：\n%O\n",
                              total[qob]));
                return 1;
        }

        str = WHT "任务名称              执行时间    状  态    任务对象对应的系统OBJECT\n" NOR
              HIW "──────────────────────────────────\n" NOR;
        foreach (qob in obs)
        {
                str += sprintf("%-22s%-12s%-10s%s\n",
                               qob->name(),
                               time_len(time() - qob->query("start_time")),
                               qob->query_status(),
                               file_name(qob));
        }
        str += HIW "──────────────────────────────────\n" NOR
               WHT "系统目前共有 " CYN + sizeof(obs) + WHT " 个任务。\n" NOR;

        me->start_more(str);

	return 1;
}

int help(object me)
{
	write(@HELP
指令格式 : qinfo [<任务名称>]

                 -n：查看任务数量。

此指令可查看当前系统有的任务。
HELP );
	return 1;
}
