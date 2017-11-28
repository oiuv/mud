// localcmds.c
// updated by doing

inherit F_CLEAN_UP;

int main(object me, string arg)
{
        object ob;
	mixed *cmds;
	int i;

        if (! SECURITY_D->valid_grant(me, "(wizard)"))
                return 0;

        if (! arg) ob = me;
        if (! ob) ob = present(arg, environment(me));
        if (! ob) ob = find_player(arg);
        if (! ob)
                return notify_fail("没有这个玩家。\n");

        if (! me->is_admin())
        {
                switch (SECURITY_D->query_site_privilege("localcmds"))
                {
                case "enable":
                        break;

                default:
                        return notify_fail("你不能查看当地的命令。\n");
                }
        }

	cmds = ob->query_commands();
	write((ob == me ? "你" : ob->name()) +"身上及四周的物品与所在的环境提供以下指令：\n");
	for(i = 0; i<sizeof(cmds); i++)
		write(sprintf("%-15s  %2d %O\n", cmds[i][0], cmds[i][1], cmds[i][2]));

	return 1;
}

int help()
{
	write(@TEXT
指令格式：localcmds

列出你身上及四周的物品与所在的环境提供的所有指令。

该命令在可以被授权使用的信息包括：enable。
TEXT );
	return 1;
}
