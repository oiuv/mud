// apply.c

inherit F_CLEAN_UP;

void create() { seteuid(getuid()); }

int main(object me, string arg)
{
        int count;
	object ob;
	object *guard;

	if (! arg)
                return notify_fail("你要使用什么东西？\n");

	if (! objectp(ob = present(arg, me)))
        {
                ob = present(arg, environment(me));

                if (! objectp(ob))
                        return notify_fail("你身上没有这样东西，附近也没有。\n");
        }

        if (! undefinedp(count = ob->query_amount()) && count < 1)
                return notify_fail(ob->name() + "已经用完了。\n");

	if (me->is_busy())
	{
		write("你上一个动作还没有完成。\n");
		return 1;
	}

        if (guard = ob->query_temp("guarded"))
        {
                guard = filter_array(guard, (:
                        objectp($1) && present($1, environment($(me))) &&
                        living($1) && ($1 != $(me)) :));
                if (sizeof(guard))
                        return notify_fail(guard[0]->name()
                                + "正守在" + ob->name() + "一旁，防止任何人拿走。\n");
        }

        if (ob->query("can_be_applied"))
        {
                return ob->do_apply(me);
        } else
                return notify_fail("怎么用" + ob->name() + "？\n");

	return 1;
}

int help(object me)
{
	write(@HELP
指令格式 : apply <物品>

这个指令可以让你是用特殊物品，发挥它的功效。
 
HELP );
        return 1;
}
