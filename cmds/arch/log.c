// log.c
// created by doing

#include <ansi.h>

inherit F_CLEAN_UP;

int main(object me, string arg)
{
        string wiz_status;
        mapping log;
        string *ks;
        object *obs;
        string msg;
        int i;
        int flag;

        if (! SECURITY_D->valid_grant(me, "(arch)"))
                return 0;

        if (! arg || arg == "")
                return notify_fail("请你指明一个玩家。\n");

	seteuid(getuid());
        if (arg == "?")
        {
                log = EXAMINE_D->query("log_by");
		msg = "";
                if (mapp(log) && sizeof(log) > 0)
                {
                        ks = keys(log);
                        flag = 0;
                        for (i = 0; i < sizeof(ks); i++)
                        {
                                if (wiz_level(me) < wiz_level(log[ks[i]]))
                                        continue;

                                if (! flag)
                                {
                                        msg +=HIW "\n目前记录的情况如下：\n"
                                              HIY "────────────────────────\n" NOR;
                                        flag = 1;
                                }
                                msg += sprintf("%s%-14s  目前被  %-14s 记录日志。\n" NOR,
                                        (wizhood(me) == "(player)") ? CYN : HIY,
                                        ks[i], log[ks[i]]);
                        }
                }

                obs = filter_array(users(), (: $1->is_loging_now() :));
                obs = sort_array(obs, (: wiz_level($1) - wiz_level($2) :));
                flag = 0;
                for (i = 0; i < sizeof(obs); i++)
                {
                        string nid;

                        if (! flag)
                        {
                                msg += HIW "\n目前正在记录的使用者情况如下：\n"
                                       HIY "────────────────────────\n" NOR;
                                flag = 1;
                        }

                        nid = obs[i]->name(1) + "(" + obs[i]->query("id") + ")";
                        msg += sprintf("%s%-20s  " HIC "%-10s  %s\n" NOR,
                                       wizardp(obs[i]) ? HIY : CYN,
                                       nid,
                                       environment(obs[i]) ? environment(obs[i])->short() : "未知地点",
                                       interactive(obs[i]) ? HIG + query_ip_name(obs[i]) : HIR "断线");
                }
                if (! flag)
                        msg += "目前没有在线玩家被记录日志。\n";
                else
                        msg += "\n";
                write(msg);
                return 1;
        }

        if (file_size(DATA_DIR + "login/" + arg[0..0] + "/" + arg + __SAVE_EXTENSION__) < 0)
                return notify_fail("咦... 没有这个玩家啊！\n");

        if (wiz_level(me) < wiz_level(arg))
                return notify_fail("你不能为自己权限高的人纪录日志。\n");

        if (wizhood(arg) == "(admin)" && ! me->is_admin())
                return notify_fail("你不能记录天神的日志。\n");

        if (EXAMINE_D->start_log_player(arg, me->query("id")))
        {
	        write("开始记录(" + arg + ")的日志。\n");
                return 1;
        }

	return 0;
}

int help (object me)
{
        write(@HELP
指令格式: log <player> | ?
 
记录 <player> 的日志，日志文件生成在 /log/user/player 下面。
如果没有声明停止记录该玩家的日志，系统将一直记录下去，即使
退出后重新连线进入也不会停止。

如果输入 ? 作为参数，列出当前记录的情况。
 
HELP );
        return 1;
}
