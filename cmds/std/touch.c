// touch.c

inherit F_CLEAN_UP;

void create() { seteuid(getuid()); }

int main(object me, string arg)
{
	object obj;

	if (! arg)
                return notify_fail("你要触摸什么物品？\n");

	if (! objectp(obj = present(arg, me)) &&
            ! objectp(obj = present(arg, environment(me))))
		return notify_fail("你身上没有这样东西，附近也没有。\n");

        if (obj->is_character())
                return notify_fail("你别乱动" + obj->name() + "了。\n");

        notify_fail("你摸了一下" + obj->name() + "。\n");
        return obj->do_touch(me);
}

int help(object me)
{
	write(@HELP
指令格式 : touch <物品名称>
 
这个指令可以让你抚摸某样东西，尝试发挥它的特殊能力。
 
HELP );
        return 1;
}
