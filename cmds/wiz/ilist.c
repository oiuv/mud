// ilist.c

inherit F_CLEAN_UP;

int main(object me, string arg)
{
	object ob;

        if (! SECURITY_D->valid_grant(me, "(wizard)"))
                return 0;

	if (! arg) return notify_fail("指令格式：ilist <物件或档名>\n");

	ob = present(arg, me);
	if (! ob) ob = present(arg, environment(me));
	if (! ob) ob = find_object(resolve_path(me->query("cwd"), arg));
	if (! ob) return notify_fail("没有这样物件或这样物件没有被载入。\n");

	write(sprintf("%O直接或间接继承以下档案：\n    %s\n", ob,
		implode(deep_inherit_list(ob), "\n    ")));
	return 1;
}

int help (object me)
{
        write(@HELP
指令格式: ilist <物件或档名>
 
列出一个物件所继承的所有物件。
 
HELP );
        return 1;
}
