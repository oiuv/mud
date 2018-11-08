// id.c

inherit F_CLEAN_UP;

int main(object me, string arg)
{
	object *inv;
	string name;
	int i, l;

	if (! arg)
	{
		inv = all_inventory(me);
		if (! sizeof(inv))
			return notify_fail("你身上没有任何东西。\n");
		write("你身上携带物品的别称如下(右方)：\n");
		for(i = 0; i < sizeof(inv); i++)
		{
			if (! me->visible(inv[i])) continue;
			name = inv[i]->name();
			l = 20 + strlen(name) - strlen(filter_color(name));
			write(sprintf("%-" + sprintf("%d", l) + "s = %s\n", name,
				implode(inv[i]->parse_command_id_list(), "、")));
		}
		return 1;
	}

	if (arg == "here")
	{
		inv = all_inventory(environment(me));
		if (! sizeof(inv))
			return notify_fail("这里没有任何东西。\n");
		write("在这个房间中, 生物及物品的(英文)名称如下：\n");
		for(i = 0; i < sizeof(inv); i++)
		{
			if (! me->visible(inv[i])) continue;
			name = inv[i]->name();
			l = 20 + strlen(name) - strlen(filter_color(name));
			write(sprintf("%-" + sprintf("%d", l) + "s = %s\n", name,
				implode(inv[i]->parse_command_id_list(), "、")));
		}
		return 1;
	}
}

int help(object me)
{
    write(@HELP
指令格式 : id [here]

这个指令可以让你知道物品的英文名称及名字. 只打 id 会显示
你身上所携带物品的名称. 'id here' 则显示所有跟你在同一个
环境里的物件名称.

HELP );
    return 1;
}
