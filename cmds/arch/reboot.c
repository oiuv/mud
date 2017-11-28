// reboot.c
// created by doing

#include <net/daemons.h>
#include <getconfig.h>
#include <ansi.h>

inherit F_CLEAN_UP;

// 启动的时间
int start_reboot = 0;
int last_notice = 0;

int is_rebooting() { return start_reboot != 0; }

private void reboot_mud();

int main(object me, string arg)
{
        string str;
        int n;
        int flag;

        if (arg == "after 10 called by memoryd")
                   flag = 1;

        else flag = 0;

        // memoryd 调用重新启动系统
        if (flag)
        {
              n = 10;
              start_reboot = time() + n * 60;
              last_notice = time();
              set_heart_beat(1);
              message_system("系统精灵将在十分钟以后重新启动" + LOCAL_MUD_NAME() + HIW "，"
                             "请抓紧时间处理你的人物。");

              return 1;
        }

        if (! SECURITY_D->valid_grant(me, "(arch)"))
                return 0;

        if (! arg)
        {
                write("指令格式: reboot [-f] | soon | after <n>\n");
                return 1;
        }

        str = me->name(1) + "(" + me->query("id") + ")";
        if (arg == "-f")
        {
                if (! find_object(SECURITY_D) ||
                    ! find_object(SIMUL_EFUN_OB) ||
                    ! find_object(MASTER_OB))
                        shutdown(0);
                        
	        if (! is_root(me) )
                {
		        write("你没有权限强制停止" + LOCAL_MUD_NAME() + "。\n");
                        return 1;
                }

                message_system(str + "强行启动了" + LOCAL_MUD_NAME() + "。");
                shutdown(0);
                return 1;
        }

	if (wiz_level(me) < 4 && ! flag)
        {
		write("你没有权限重新启动" + LOCAL_MUD_NAME() + "。\n");
                return 1;
        }

        if (sscanf(arg, "after %d", n) != 1)
        {
                if (arg != "soon")
                {
                        if (arg != "cancel")
                        {
                                write("参数错误，请查看帮助。\n");
                                return 1;
                        }

                        if (start_reboot)
                        {
                                start_reboot = 0;
                                set_heart_beat(0);
                                message_system(str + "取消了启动，游戏继续进行。");
                                write("Ok.\n");
                                return 1;
                        }

                        write("现在MUD正在正常的运行。\n");
                        return 1;
                }
                message_system(str + "重新启动了" + LOCAL_MUD_NAME() + "。");
                reboot_mud();
        }

        if (n < 1)
        {
                write("没有这么短的时间，你不如选择 soon 立刻启动。\n");
                return 1;
        }

        if (n > 10)
        {
                write("这么久？你还是等一会儿再启动吧。\n");
                return 1;
        }

        start_reboot = time() + n * 60;
        last_notice = time();
        set_heart_beat(1);
        message_system(str + "决定在" + chinese_number(n) +
                       "分钟以后重新启动" + LOCAL_MUD_NAME() + "。");
        return 1;
}

private void heart_beat()
{
        int t;
        int n;
        string str;

        if (! start_reboot) return;

        n = start_reboot - time();
        if (n < 1)
        {
                reboot_mud();
                return;
        }

        if (n >= 60) str = chinese_number(n / 60) + "分钟"; else
                     str = "";
        if (n % 60) str += chinese_number(n % 60) + "秒";

        t = time() - last_notice;
        if ((n >= 60 && t >= 60) || (n < 60 && n >= 10 && t >= 10) || n < 10)
        {
                message_system(LOCAL_MUD_NAME() + "将在" +
                               str + "以后重新启动，请抓紧时间处理你的人物。");
                last_notice = time();
        }
}

private void reboot_mud()
{
	object *user, link_ob;
	int i;

	message_system("游戏重新启动，请稍候一分钟再 login 。\n");

	user = users();
	for (i = 0; i < sizeof(user); i++)
	{
		if (! environment(user[i])) continue;
                user[i]->delete("quest");
		user[i]->save();
		link_ob = user[i]->query_temp("link_ob");
		if (objectp(link_ob)) link_ob->save();
	}

        // 保存所有的守护进程的数据
        reset_eval_cost();
	if (find_object(DNS_MASTER)) DNS_MASTER->send_shutdown();
        if (find_object(NAME_D))     NAME_D->mud_shutdown();
        if (find_object(FAMILY_D))   FAMILY_D->mud_shutdown();
        if (find_object(CLOSE_D))    CLOSE_D->mud_shutdown();
        if (find_object(DBASE_D))    DBASE_D->mud_shutdown();

	shutdown(0);
}

int help (object me)
{
        write(@HELP
指令格式: reboot [-f] | soon | after <n> | cancel
 
重新起动游戏。如果采用 -f 参数，则系统强制启动，而不保存任何
进度，这是供系统出错时使用的。如果使用了参数soon，则系统将立
刻重新启动，而使用 after n 则系统将在 n 分钟以后重新启动。

使用了 -f 参数则 soon 和 after 无效。

如果使用了 after 参数，可以使用 cancel 参数中止启动的过程。
 
HELP );
        return 1;
}
