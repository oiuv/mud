// cd.c
// updated by doing

inherit F_CLEAN_UP;

int main(object me, string arg)
{
	string dir;

        if (! SECURITY_D->valid_grant(me, "(wizard)"))
                return 0;

	if (! arg)
		arg = user_path(me->query("id"));
	dir = resolve_path(me->query("cwd"), arg);

        seteuid(geteuid(me));
	if (file_size(dir) != -2)
                return notify_fail("没有这个目录。\n");

        if (! MASTER_OB->valid_read(dir, me, "cd"))
                return notify_fail("你没有权限访问该目录。\n");

	if(dir[strlen(dir)-1]!='/') dir += "/";
	me->set("cwd", dir);
	write("当前目录变更为：" + dir + "\n");
	return 1;	
}

int help(object me)
{
	write(@HELP
指令格式 : cd <子目录名>, cd .. , and cd

将目前参考的目录移至指定的子目录或回到上一主目录; 亦可直接回到自己工作目录。
HELP );
	return 1;
}
