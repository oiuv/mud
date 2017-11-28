// wimpy.c

inherit F_CLEAN_UP;

int help(object me);

int main(object me, string arg)
{
	int wmp;

	if( !arg ) {
		write("你现在的当「气」低於 " + (int)me->query("env/wimpy") 
			+ "% 时就会尝试逃跑。\n");
		return 1;
	}
	if( sscanf(arg, "%d", wmp)!=1 || wmp < 0 || wmp > 80)
		return help(me);

	me->set("env/wimpy", wmp);
	write("Ok.\n");
	return 1;
}

int help(object me)
{
	write(@HELP
指令格式： wimpy [<逃跑时「气」的百分比>]

这个指令让你设定当「气」剩下百分之多少时，要开始「转进」。
HELP
	);
	return 1;
}

