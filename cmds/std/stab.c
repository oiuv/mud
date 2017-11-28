// stab.c

inherit F_CLEAN_UP;

void create() { seteuid(getuid()); }

int main(object me, string arg)
{
	object obj;

	if (! arg)
                return notify_fail("你要用什么物品？\n");

	if (! objectp(obj = present(arg, me)))
		return notify_fail("你身上没有这样东西。\n");

        notify_fail("你翻来复去的弄了一会儿，也没能折腾好" + obj->name() + "。\n");
        return obj->do_stab(me);
}

int help(object me)
{
	write(@HELP
指令格式 : stab <物品名称>
 
这个指令可以让你将某样东西插在地面上，比如标志牌什么的。
 
HELP );
        return 1;
}
