#include <room.h>
inherit ROOM;

void create()
{
        set("short", "断桥");
        set("long", @LONG
断桥正好在外湖和里湖的分水点上。这里亭轩错落，掩映在绿树
佳荫之下。“山明水秀轩扉启，落日渔歌过里湖”，就是描述这里傍
晚的景色。在断桥上可浏览环湖诸山和湖中诸岛的风光。每当雪过後，
站在桥头，只见一切都被覆上白雪，玉琢银楼的湖山风貌就是西湖十
景之一的“断桥残雪”。民间神话“白蛇传”中的白娘娘和许仙就在
这里相会的。过桥往南走便是白堤了。东北边可通往青石大道。
LONG);
        set("exits", ([
            	"northeast" : __DIR__"road9",
            	"south"      : __DIR__"baiti",
        ]));
        set("objects", ([
            	__DIR__"npc/poorman" : 1,
        ]));
        set("outdoors", "hangzhou");
        setup();
        replace_program(ROOM);
}
