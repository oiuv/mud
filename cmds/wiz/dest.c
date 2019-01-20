// dest.c

inherit F_CLEAN_UP;

int main(object me, string arg)
{
	string option, target/*, msg*/;
	object obj;
        int opt_clone;
        object *obs;

        if (! SECURITY_D->valid_grant(me, "(wizard)"))
                return 0;

	if (! arg)
                return notify_fail("指令格式 : dest <物件之名称或档名>\n");

	if (sscanf(arg, "%s %s", option, target) == 2 &&
            option == "-c")
        {
                opt_clone = 1;
        } else
        {
                target = arg;
                opt_clone = 0;
        }

	obj = find_object(target);
	if (! obj) obj = present(target, me);
	if (! obj) obj = present(target, environment(me));
	if (! obj) obj = find_object(target);
	if (! obj) obj = find_object(resolve_path(me->query("cwd"), target));
	if (! obj) return notify_fail("没有这样物件....。\n");

        seteuid(getuid());

        if (! me->is_admin())
        {
                switch (SECURITY_D->query_site_privilege("dest"))
                {
                case "all":
                        break;

                case "noneuser":
                        if (playerp(obj))
                                return notify_fail("你不能对玩家施展法力。\n");
                        break;

                case "user":
                        if (! playerp(obj))
                                return notify_fail("你只能对玩家施展法力。\n");
                        break;

                default:
                        return notify_fail("你不能使用该命令。\n");
                }
        }

	if (! is_root(me)) seteuid(geteuid(me));

        if (! SECURITY_D->valid_write(base_name(obj), me, "dest"))
        {
                write("你没有权限操作这个对象。\n");
                return 1;
        }

        if (opt_clone)
        {
                if (clonep(obj))
                {
                        write("该对象是复制对象，没有派生对象，无法执行 -c 选项。\n");
                        return 1;
                }

                if (obj == find_object(USER_OB))
                {
                        write("你不能清除使用者的派生对象。\n");
                        return 1;
                }

                if (obj == find_object(LOGIN_OB))
                {
                        write("你不能清除使用者连接信息的派生对象。\n");
                        return 1;
                }

                obs = children(base_name(obj));
                foreach (obj in obs)
                {
                        write("你摧毁了" + obj->name(1) + "(" +
                              file_name(obj) + ")。\n");
                        destruct(obj);
                }
                write("Ok.\n");
                return 1;
        }

	if (me == obj)
		message_vision("$N召唤出一个黑洞，一头钻了进去。\n", me);
	else
	if (environment(me) == environment(obj))
		message_vision("$N召唤出一个黑洞，一脚把将$n踢了进去。\n", me, obj);

	destruct(obj);
	if (obj) write("你无法将这个物件摧毁。\n"); else
	if (me) write("Ok.\n");

	return 1;
}

int help(object me)
{
	write(@HELP
指令格式 : dest [-c] <物件之名称或档名>

利用此一指令可将一个物件 object 从记忆体中清除，若清除物件，
则下一次参考到这个物件的时候会重新将它编译。

如果使用了 -c 参数，则将清除该档案派生出的所有对象。

该命令在可以被授权使用的信息包括：noneuser、user、all。

参考资料： destruct()
HELP );
        return 1;
}