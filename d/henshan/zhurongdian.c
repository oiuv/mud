#include <ansi.h>

inherit ROOM;

void create()
{
        set("short", "祝融殿");
        set("long", 
"祝融殿，又名老圣殿，祠火神祝融。花岗石砌墙，铁瓦覆\n顶，殿"
"宇凌空傲雪，巍然屹立在衡山绝顶。殿门的石楹上刻着\n有「" HIW
"寅宾日出，峻极于天" NOR "」的字样，远远看去字峰雄浑而有力。"
"\n殿上还立有「" HIR "圣德重华" NOR "」的楣额。\n");
        set("exits", ([
                "southdown"  : __DIR__"wangritai",
                "northdown"  : __DIR__"wangyuetai",
                "westup"     : __DIR__"shanlu003",
	        "east"       : __DIR__"changlang",
        ]));

	set("objects", ([
                CLASS_D("henshan") + "/mi" : 1,
                __DIR__"npc/dizi1"   : 4,
		__DIR__"npc/xiangke" : 2,
	]));
	set("no_clean_up", 0);
        setup();

        "/clone/board/henshan_b"->foo();
}

int valid_leave(object me, string dir)
{
        object guard;

        if (dir == "northdown"
           || ! objectp(guard = present("mi weiyi", this_object())))
                return ::valid_leave(me, dir);

        return guard->permit_pass(me, dir);
}
