#include <ansi.h>
inherit ROOM;

string look_gaoshi();

void create()
{
        set("short", "兰州北门");
        set("long", @LONG
这是兰州城的北城门，由于这里的环境干燥，经过几年的
风沙侵蚀显得有些破败。城门正上方勉勉强强可以认出北门两
个大字，城墙上贴着几张通缉告示(gaoshi)。许多罪犯常常经
过这里逃到西域，官兵们戒备森严，动不动就截住行人进行盘
问。一条笔直的青石大道向南北两边延伸。北边是郊外，许多
西域来的商人都从这里进城。许多本地人也赶着牲口从这里经
过，到城里去卖掉自己种的瓜果，再买回生活必需品。南边是
城里。
LONG);
        set("outdoors", "lanzhou");
        set("item_desc", ([
                "gaoshi" : (: look_gaoshi :),
        ]));
        set("exits", ([
                "north" : __DIR__"nroad1",
 		"south" : __DIR__"beidajie2",
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
