// more.c

inherit F_CLEAN_UP;

int main(object me, string arg)
{
	string file;
	object ob;

        if (! SECURITY_D->valid_grant(me, "(wizard)"))
                return 0;

	seteuid(geteuid(me));
	if (! arg) return notify_fail("指令格式 : more <档名>|<物件名> \n");
	file = resolve_path(me->query("cwd"), arg);
	if (file_size(file) < 0)
        {
		ob = present(arg, me);
		if (! ob) ob = present(arg, environment(me));
		if (! ob) return notify_fail("没有这个档案。\n");
		file = base_name(ob) + ".c";
	}

	if (! SECURITY_D->valid_read(file, me, "read"))
		return notify_fail("你没有权限查看这个文件。\n");

	me->start_more_file(file);
	return 1;
}

int help(object me)
{
        write(@HELP
指令格式 : more <档案名>

这个指令让你可以以分页方式查阅一个文件的内容。

see also: cat
HELP );
        return 1;
}
