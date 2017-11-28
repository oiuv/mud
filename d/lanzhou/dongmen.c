#include <ansi.h>
inherit ROOM;

string look_gaoshi();

void create()
{
        set("short", "兰州东门");
        set("long", @LONG
这是兰州城的东城门，由于这里的环境干燥，经过几年的
风沙侵蚀显得有些破败。城门正上方勉勉强强可以认出东门两
个大字，城墙上贴着几张通缉告示(gaoshi)。许多来边疆做苦
力的罪犯常常经过这里逃回中原，官兵们戒备森严，动不动就
截住行人进行盘问。一条笔直的青石大道向东西两边延伸。东
边是郊外，许多西域来的商人都是从这里出城，向东到达中原。
许多本地人也赶着牲口从这里经过，到城里去卖掉自己种的瓜
果，再买回生活必需品。西边是城里。
LONG);
        set("outdoors", "lanzhou");
        set("item_desc", ([
                "gaoshi" : (: look_gaoshi :),
        ]));

        set("exits", ([
                "west" : __DIR__"dongdajie1",
                "east" : "/d/changan/lzroad",
                
        ]));
        set("objects", ([
                "/d/city/npc/bing" : 4,
                "/clone/npc/xunbu" : 1,
                "/d/beijing/npc/ducha" : 1,
        ]));
        setup();
        //replace_program(ROOM);
}

string look_gaoshi()
{
        return FINGER_D->get_killer() + "\n         兰州知府\n                     耶律巡\n";
}

