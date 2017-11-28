// shandong.c

inherit ROOM;
#include <ansi.h>

void create()
{
        set("short", "山洞");
	set("long",
		"这里是一个不大的山洞，奔腾的瀑布成了它的门帘，阳光轻易就"
		"可以的透过水帘射进来，因此这里白天并不阴暗。");
        set("exits", ([ /* sizeof() == 2 */
                "out"  : __DIR__"shanhongpb",
                "enter": __DIR__"s",
        ]));

        setup();
        (CLASS_D("ultra") + "/dugu")->come_here();
}

string long()
{
        object ob;
        string msg;

	msg = query("long");
        if (! objectp(ob = present("dugu qiubai", this_object())))
                return sort_string(msg, 64, 4);

        if (! ob->is_fighting())
                msg += "只见一人坐在地上，手中抱着一柄竹剑，翻了复"
                       "去的看，也不知道在研究什么。\n";
        else
                msg += "只见一人正在与" +
                       (ob->is_fighting(this_player()) ? "你" : "人") +
                       "激战，竹剑施展开来竟然有诺大的威力，真是匪夷所思。\n";

        return sort_string(msg, 64, 4);
}

int valid_leave(object me, string dir)
{

        if (dir == "enter")
        {
                write(HIG "\n你进入山洞，只觉四周漆黑一片，你一直不停地往前走… \n" NOR);
                write(HIG "不久，穿过了山洞，只见前方却是悬崖峭壁。\n\n");
        }
        
        return 1;
}