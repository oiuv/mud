// vote command..
// Modified by Marz, 04/18/96

#include <net/dns.h>
#include <ansi.h>

inherit F_CLEAN_UP;

int valid_voters(object me);

void create() { seteuid(getuid()); }

int main(object me, string arg)
{
	object victim;
	string act_name, victim_name;
	string file;
	object file_ob;

	if (((int) me->query("age") < 18) && ! wizardp(me))
		return notify_fail("民主不是儿戏！小孩子一边玩去！\n");

	if ((int) me->query("vote/deprived"))
        {
                // 是否被剥夺投票权？还没有恢复呢？
                if (time() - me->query("vote/deprived") >= 86400)
                        me->delete("vote/deprived");
                else
		        return notify_fail("你想起当初玩弄民主、被剥夺投票权的事，追悔莫及。\n");
        }

    	if (! arg || sscanf(arg, "%s %s", act_name, victim_name) != 2)
		return notify_fail("这神圣的一票，要想清楚了才能投。\n");
    
	victim = find_player(victim_name);
        if (! objectp(victim))
        {
                string temp;
                temp = victim_name;
                victim_name = act_name;
                act_name = temp;
                victim = find_player(victim_name);
        }

	if (! victim) return notify_fail("你要投谁的票？\n");
	if (wizardp(victim)) return notify_fail("你要投巫师的票？\n");
		
	if (! stringp(file = (string)"/cmds/std/vote/" + act_name) ||
            file_size(file + ".c") <= 0)
                return notify_fail("你要投票干什么？\n");

        call_other(file, "???");
        file_ob = find_object(file);

	if ((int)file_ob->vote(me, victim) <= 0)
	{
		if ((int)me->query("vote/abuse") > 50)
		{
			write(HIG "你因为胡乱投票，投票权被暂时剥夺24小时！\n" NOR);
			me->set("vote/deprived", time());
			me->delete("vote/abuse");
		}
		return 0;
	}

        log_file("static/vote", sprintf("%s %s vote: %s %s\n",
                                        log_time(), log_id(me),
                                        act_name, victim_name));

	return 1;
}

int valid_voters(object me)
{
	object *list;
	int d = 0;
	int j;

    	list = users();
    	j = sizeof(list);
    	while (j--)
	{
		// Skip those users in login limbo.
        	if (! environment(list[j])) continue;
        	if (! me->visible(list[j])) continue;
		if (((int)list[j]->query("age") < 18) && ! wizardp(list[j])) continue;
		if ((int)list[j]->query("vote/deprived")) continue;

		d++;
	}
	
	return d;
}


int help(object me)
{
write(@HELP
指令格式 : vote <动议> <某人> 

此命令提议对某人采取行动，由大家投票决定。可是如果五分钟内没有人附议，
投票会自动取消。当前可以有如下<动议>：

chblk:   关闭某人频道，需三票以上，十个人同意或是简单多数同意，如果
                       被表决的玩家14岁，那么只需要三人同意即可。
unchblk: 打开某人频道，需三票以上，十五个人同意或是简单多数同意。

注意：投票可以使用任何不同IP区域的合法ID，但是如果利用投票恶意骚扰其
它玩家，则将导致监禁72小时或是PURGE的严厉惩戒，并且此惩戒将波及该 ID
的所有人物，务必小心使用投票权。

HELP );
    return 1;
}
