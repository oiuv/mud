// #pragma optimize
// #pragma save_binary

inherit F_DBASE;

#include <ansi.h>

int reboot_now = 0;
int clean_up() { return 1; }

void auto_relaim();

void create()
{
        seteuid(ROOT_UID);
        set("name", HIR "系统精灵" NOR);
        set("channel_id", "内存精灵");
        CHANNEL_D->do_channel( this_object(), "sys", "内存精灵已经启动。");
        call_out("auto_relaim", 40);
}

void auto_relaim()
{
        int i;      
	int t;
        string str;

	t = uptime();
	t /= 60;
	t /= 60;
	t /= 24;

        if (i = reclaim_objects())
	        CHANNEL_D->do_channel( this_object(), "sys",
		        sprintf("系统自动清除 %d 个变量。", i));

        remove_call_out("auto_relaim");
        call_out("auto_relaim", 600);

        //if (t >= 14 && ! "/cmds/arch/reboot"->is_rebooting() )
        if (t >= 99 && ! "/cmds/arch/reboot"->is_rebooting() )
        {
            reboot_now = 1;
            str = "/cmds/usr/uptime"->main("-r");
            "/cmds/arch/reboot"->main(this_object(), "after 10 called by memoryd");
            log_file("sys_reboot", "system rebooting : " + str);
        }

        __DIR__"qdeld"->qdel();
        
}
