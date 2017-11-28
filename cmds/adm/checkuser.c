// checkuser.c
// Doing

inherit F_CLEAN_UP;

int main(object me,string arg)
{
        object ob;
        int period;
        int min;
        int sec;

	seteuid(geteuid(me));

        if (! SECURITY_D->valid_grant(me, "(admin)"))
                return 0;

	if(!arg)
		ob = me;
	else
        {
		if (! ob) ob = find_player(arg);
		if (! ob) ob = find_living(arg);
                if (! ob) return notify_fail("你要检查那一位使用者？\n");
	}

        period = time() - (int) ob->query("last_save");
        min = period / 60;
        sec = period - min * 60;
        if (period == 0)
                write ("该使用者刚刚保存过进度。\n");
        else
        {
                write("该使用者距上次存盘时间是");
                if (min) write (chinese_number(min) + "分钟");
                if (sec) write (chinese_number(sec) + "秒");
                write ("。\n");
        }

	return 1;
}

int help(object me)
{
	write(@HELP
指令格式 : checkuser <user>

这个命令用来查询使用者的某些状态。 

HELP
    );
    return 1;
}
 
