// cleanup.c

inherit F_CLEAN_UP;

int main(object me, string str)
{
	object ob, where, *ob_list;
	int old_size, i;

        if (! SECURITY_D->valid_grant(me, "(arch)"))
                return 0;

	if (! str) return notify_fail("指令格式：cleanup <档名>\n"); 

	str = resolve_path(me->query("cwd"), str);
	ob_list = children(str);
	old_size = sizeof(ob_list);
	ob_list->clean_up();
	for (i = 0; i < sizeof(ob_list); i++)
		if (ob_list[i] && clonep(ob_list[i]) && ! environment(ob_list[i]))
			destruct(ob_list[i]);
	ob_list -= ({ 0 });
	write(sprintf("清除 %d 个物件。\n", old_size - sizeof(ob_list)));
	return 1;
}

int help(object me)
{
	write(@HELP
指令格式：cleanup <档名>

对所有指定档名的物件呼叫 clean_up，并且清除所有被复制出来的，但是又没有
被放在另一个物件中的散失物件。
HELP );
	return 1;
}
