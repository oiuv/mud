// brothers

#include <ansi.h>
#include <getconfig.h>

inherit F_CLEAN_UP;

int sort_brothers(string id1, string id2);

void create() { seteuid(getuid()); }

int main(object me, string arg)
{
        object  who;
        object  ob;
        string  msg;
        string  pro;
        mapping bro;
        string *ids;
        string  id;
        string  nid;

        if (arg && sscanf(arg, "out %s", arg) == 1)
        {
                if (! me->is_brother(arg))
                        return notify_fail("你现在没有这个结拜兄弟啊。\n");

                if (me->query_temp("pending/brother_out") != arg)
                {
                        write("你确定要和这位朋友(" + arg + ")割袍断义吗？\n"
                              YEL "如果你确定，请再输入一次这条命令。\n" NOR);
                        me->set_temp("pending/brother_out", arg);
                        return 1;
                }

                me->delete_temp("pending/brother_out");
                if (objectp(ob = find_player(arg)) &&
                    environment(ob) == environment(me))
                {
                        // is the brother at present now?
                        message_vision("$N一声叹息，看着$n，绝决道：“" + ob->name(1) +
                                       "不必多说，从今往后，你和我再也没有半点关系了！”\n",
                                       me, ob);
                }

                nid = me->query("brothers/" + arg) + "(" + arg + ")";
                write("你和" + nid + "断绝了关系。\n");
                id = me->query("id");
                CHANNEL_D->do_channel(this_object(), "rumor",
                        "听说" + me->name(1) + "(" + id + ")"
                        "和" + nid + "割袍断义，断绝了来往。");

                // remove the brother's association
                UPDATE_D->clear_user_data(id, "brothers:" + arg);
                UPDATE_D->clear_user_data(arg, "brothers:" + id);
                return 1;
        }

        if (! arg || ! wizardp(me))
        {
                who = me;
                pro = "你";
        } else
        {
                if (! objectp(who = find_player(arg)))
                        return notify_fail("没有找到这个玩家。\n");
                else
                        pro = who->name(1);
        }

	if (! mapp(bro = who->query("brothers")) || sizeof(bro) < 1)
                return notify_fail(pro + "现在还没有结义的兄弟们。\n");

        msg = pro + "现在" + LOCAL_MUD_NAME() + "的结义兄弟都有：\n\n";
        ids = keys(bro);
        ids = sort_array(ids, (: sort_brothers :));
        foreach (id in ids)
        {
                nid = (string) bro[id] + "(" + id + ")";
                msg += sprintf(WHT "%-14s  ", nid);
                if (objectp(ob = find_player(id)))
                        msg += sprintf(HIY "在线   "
                                       NOR WHT "经验：" HIC "%-9d "
                                       NOR WHT "阅历：" HIW "%-8d "
                                       NOR WHT "威望：" HIY "%-8d\n" NOR,
                                       ob->query("combat_exp"),
                                       ob->query("score"),
                                       ob->query("weiwang"));
                else
                        msg += HIR "不在线\n" NOR;
        }
        write(msg);

	return 1;
}

int sort_brothers(string id1, string id2)
{
        object ob1, ob2;

        ob1 = find_player(id1);
        ob2 = find_player(id2);
        if (! objectp(ob1) && ! objectp(ob2))
                return strcmp(id2, id1);

        if (objectp(ob1) && objectp(ob2))
                return ob2->query("combat_exp") - ob1->query("combat_exp");

        if (objectp(ob1))
                return -1;

        return 1;
}

int help(object me)
{
   	write( @HELP
指令格式: brothers 无参数 | out <sb>

查看自己现在的结义兄弟们。如果使用 brothers out <sb> 可以解
除结义关系。

see also：swear
HELP );
   	return 1;
}
