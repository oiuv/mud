#include <ansi.h>
inherit RIVER;

void create()
{
	set("short", "宣和堡");
	set("long", @LONG
这里就是西北小镇宣和堡，南面是黄河，西面是沙漠，只
有这里有片不大的绿洲，住户们都是从关内迁移过来的，大多
以经营手工艺品为生，这里的手织羊毛挂毯颇有名气。每逢节
日附近的百姓都来到这摆渡过河 (river)到关内去赶集。河案
边熙熙攘攘，人们都在挣着叫船过河。
LONG);
        set("arrive_room", "/d/huanghe/guchangcheng");
	set("exits", ([
		"northeast" : __DIR__"mingshazhou",
	]));

        set("resource/fish", ({ "/clone/fish/liyu",
                                "/clone/fish/jiyu",
                                "/clone/fish/qingyu",
                                "/clone/fish/caoyu", }));

	set("outdoors", "lingzhou");
        setup();
        replace_program(RIVER);
}

