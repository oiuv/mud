// #pragma optimize
// #pragma save_binary

inherit F_DBASE;

#include <ansi.h>

int clean_up() { return 1; }

void recordmem();
string memory_expression(int m);

void create()
{
        seteuid(ROOT_UID);
        set("channel_id", "内存精灵");
        CHANNEL_D->do_channel( this_object(), "sys", "内存记录精灵已经启动。");
        recordmem();
}

void recordmem()
{
        string memcost, uptime;
       
        remove_call_out("protect");
        call_out("recordmem", 900);

        memcost = memory_expression(memory_info());

        uptime = "/cmds/usr/uptime"->main("-r");

        log_file("meminfo",  sprintf("\n运行时间：%s消耗内存：%s\n",
                                     uptime, memcost) );
       
}

string memory_expression(int m)
{
	float mem;

	mem = m;
	if (mem < 1024 ) return m + "";
	if (mem < 1024*1024)
		return sprintf("%.2f K", (float)mem / 1024);

	return sprintf("%.3f M", (float)mem / (1024*1024));
}