// changename.c
// created by doing

inherit F_CLEAN_UP;

int main(object me, string arg)
{
        string id, new_name;
	object ob;
        string result;
        string *opts;
        int i;
        int opt_force;

        if (! SECURITY_D->valid_grant(me, "(arch)"))
                return 0;

        if (! arg)
                return notify_fail("你要修改哪一个玩家的中文名字？\n");

        // 强制修改名字的标志
        opt_force = 0;
        opts = explode(arg, " ");
        for (i = 0; i < sizeof(opts); i++)
        {
                if (opts[i] == "-f")
                {
                        opt_force = 1;
                        opts[i] = 0;
                }
        }

        // 判断完毕选项以后重新判断参数
        opts -= ({ 0 });
        arg = implode(opts, " ");

	if (sscanf(arg, "%s %s", id, new_name) == 2)
        {
		ob = find_player(id);
		if (! objectp(ob))
			return notify_fail("这个玩家不在线上。\n");

                if (! LOGIN_D->check_legal_name(new_name, 8))
                        return 0;

                result = NAME_D->change_name(ob, new_name, opt_force);
                if (result)
                {
                        write(result);
                        if (opt_force)
                                write("系统强制修改了 " + id + " 的名字。\n");
                }
                else
                        write("成功的修改改了 " + id + " 的名字。\n");
                return 1;
	} else
		return notify_fail("格式：changename [-f] <玩家ID> <新名字>\n");
}

int help(object me)
{
write(@HELP
指令格式 : changename [-f] <玩家ID> <新名字>
 
更改玩家的中文名字，因为所有玩家的中文名字都记录在系统中，所
以如果直接修改将会造成数据不一致。如果采用了-f参数，则系统会
强制修改名字而不顾及原先是否有重名或是相近的名字。

HELP );
    return 1;
}
