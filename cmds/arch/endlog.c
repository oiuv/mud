// endlog.c
// created by doing

inherit F_CLEAN_UP;

int main(object me, string arg)
{
        object ob;
        string wiz_status;

        if (! SECURITY_D->valid_grant(me, "(arch)"))
                return 0;

        if (! arg)
                return notify_fail("请你指明一个玩家。\n");

	wiz_status = SECURITY_D->get_status(me);

	seteuid(getuid());

        if (EXAMINE_D->end_log_player(arg, me->query("id")))
        {
	        write("停止记录(" + arg + ")的日志。\n");
                return 1;
        }

	return 0;
}

int help(object me)
{
        write(@HELP
指令格式: endlog <player>
 
停止记录 <player> 的日志。如果这个玩家被设置为永久记录日志，
则该项设置将取消。除了 admin，只有等级不亚于开始记录日志者的
巫师才能够取消记录日志。
 
HELP );
        return 1;
}
