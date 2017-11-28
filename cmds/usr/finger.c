// finger.c

inherit F_CLEAN_UP;

void create()
{
        seteuid(getuid());
}

int main(object me, string arg)
{
        object *ob;

        if (time() - me->query_temp("scan_time") < 10
           && ! wizardp(me))
                return notify_fail("等等，系统喘气中……\n");

        if (! arg)
        {
                if ((int)me->query("jing") < 50)
                        return notify_fail("你的精神无法集中。\n");

                me->receive_damage("jing", 50);
                me->set_temp("scan_time", time());
                me->start_more(FINGER_D->finger_all());
        } else
        if (arg == "-m")
        {
                if (! wizardp(this_player()))
                        return notify_fail("你无权使用 -m 参数。\n");

                ob = filter_array(users(), (: $1->name() != $1->name(1) :));
                me->set_temp("scan_time", time());
                me->start_more(FINGER_D->user_list(ob), 0);
        } else
        {
                if ((int)me->query("jing") < 20)
                        return notify_fail("你的精神无法集中。\n");

                me->set_temp("scan_time", time());
                write(FINGER_D->finger_user(arg));
        }
        return 1;
}

int help(object me)
{
  write(@HELP
指令格式：finger [-m] [使用者姓名]
 
这个指令，如果没有指定使用者姓明，会显示出所有正在线上玩家
的连线资料。反之，则可显示有关某个玩家的连线，权限等资料。
如果使用了 -m 参数，可以列出使用面具的玩家。
 
相关指令：who
HELP);
        return 1;
}
