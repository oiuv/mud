#include <ansi.h>
inherit ROOM;

void create()
{
        set("short", "万毒窟外");
        set("long", @LONG
这里是五毒教饲养毒物的地方，山壁旁有一个天然的石洞，里面
黑漆漆的看不清楚。一阵山风吹来，你闻到一股腥味。有一个衣衫褴
褛的枯瘦老妇正靠在洞边打盹。 
LONG);
        set("outdoors", "wudujiao");

        set("exits", ([
                "south" : __DIR__"wandu2",
                "north" : __DIR__"wdsl3",
        ]));
        set("objects", ([
                CLASS_D("wudu") + "/hehongyao" : 1,
        ]));
        setup();
}
int valid_leave(object me, string dir)
{
        if (dir == "south")
        {
                if (me->query("family/master_name") != "何铁手"
                & objectp(present("he hongyao", environment(me))))
                        return notify_fail(CYN "何红药身形一晃，挡住你喝道：没有"
                                           "教主准许，谁也不得进入本教圣地。\n"
                                           NOR);
        }
        return ::valid_leave(me, dir);
}
