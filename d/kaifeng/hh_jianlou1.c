#include <ansi.h> 

inherit ROOM;

void create()
{
        set("short", "藏剑楼一层");
        set("long", @LONG
这里是红花会二当家无尘道长的静修之处，无尘道长号称
追魂夺命剑，因此将此地命为「藏剑楼」。楼分三层，一楼摆
设很简单，惟有一桌一椅。
LONG);
        set("no_clean_up", 0);
        set("exits", ([
  		"south" : __DIR__"hh_xiaojing1",
  		"up" : __DIR__"hh_jianlou2",
	]));
        set("objects", ([
                CLASS_D("honghua") + "/wuchen" : 1,
        ]));
        setup();
}

int valid_leave(object me, string dir)
{
//      int i;
//      object ob;
        me = this_player();

        if (dir == "up")
        {
                if ((string)me->query("family/family_name") != "红花会"
                & objectp(present("wuchen daozhang", environment(me))))
                        return notify_fail(CYN "无尘道长对你喝道：何方妖孽，竟敢"
                                           "闯入我私人练功之地。\n" NOR);
        }
        return ::valid_leave(me, dir);
}