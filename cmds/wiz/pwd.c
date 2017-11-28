// pwd.c

inherit F_CLEAN_UP;

int main(object me, string arg)
{
        if (! SECURITY_D->valid_grant(me, "(wizard)"))
                return 0;

        seteuid(getuid());

	write("Cwd: " + (string)me->query("cwd") +  "\n");
	write("Cwf: " + (string)me->query("cwf") +  "\n");
	return 1;
}

int help(object me)
{
        write(@HELP
指令格式 : pwd
 
这个指令会显示出你目前的工作目录 (cwd) 及工作档案 (cwf).
'update' 不加参数时便会更新你的 cwf.
 
HELP );
    return 1;
}
