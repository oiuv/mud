// cost.c

inherit F_CLEAN_UP;

int main(object me, string arg)
{
//	mapping before,after;
	int /*stime,usertime,*/ eval_cost;

        if (! SECURITY_D->valid_grant(me, "(wizard)"))
                return 0;

	if (me != this_player(1))
                me = this_player(1);

	seteuid(getuid());
   	if (! arg) return notify_fail("指令格式：cost <指令> [<参数> ....]\n");

	eval_cost = eval_cost();
	me->force_me(arg);
	eval_cost -= eval_cost();
	write(sprintf("\nEval cost：%d 单位\n", eval_cost));
	return 1;
}

int help()
{
	write( @TEXT
指令格式：cost <指令> [<参数> .... ]

这个指令让你测量另一个指令执行所需的时间。
TEXT );
	return 1 ;
}