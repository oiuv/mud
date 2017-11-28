// ff.c

inherit F_CLEAN_UP;

int main(object me, string arg)
{
	object ob;
	string dest, func, file;

        if (! SECURITY_D->valid_grant(me, "(wizard)"))
                return 0;

	if (! arg || sscanf(arg, "%s %s", dest, func) != 2)
		return notify_fail("指令格式：ff <物件> <函数名称>\n");

	if (dest == "me") ob = me; else
        if (dest == "here") ob = environment(me); else
                            ob = present(dest, me);

	if (! ob) ob = present(dest, environment(me));
	if (! ob) ob = find_object(resolve_path(me->query("cwd"), dest));
	if (! ob) return notify_fail("这里没有「" + dest + "」。\n");

	file = function_exists(func, ob);
	if (! file)
		write(sprintf("物件 %O 并没有定义 %s 这个函数。\n", ob, func));
	else
		write(sprintf("物件 %O 的 %s 函数定义在 %s.c。\n", ob, func, file));
	return 1;
}

int help()
{
	write(@TEXT
指令格式：ff <物件> <函数名称>

这个指令可以找出指定物件中的某个函数定义在哪一个档案里。
TEXT );
	return 1;
}
