// where.c
// 06-14-95

inherit F_CLEAN_UP;

int main(object me, string str)
{
        object ob, where/*, *ob_list*/;
//      int i;

        if (! SECURITY_D->valid_grant(me, "(wizard)"))
                return 0;

        if (! str)
                return notify_fail("指令格式：where <人物或档名>\n"); 

        ob = find_player(str);
        if (! ob) ob = find_living(str);
        if (! ob || ! me->visible(ob))
        {
                str = resolve_path(me->query("cwd"), str);
                ob = find_object(str);
        }

        if (! ob)
                return notify_fail("没有找到这个物品。\n");

        where = environment(ob);
        if (! where)
                return notify_fail("这个人不知道在那里耶...\n");

        write(sprintf("%s(%s)现在在%s(%s).\n",
                (string)ob->name(1),
                (string)ob->query("id"),
                (string)where->short(),
                (string)file_name(where)));
        return 1;
}

int help(object me)
{
        write(@HELP
指令格式: where <人物ID>

这个指令是用来得知人物目前所在的位置.

HELP );
        return 1;
}
