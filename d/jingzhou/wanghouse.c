#include <ansi.h>
inherit ROOM;

void create()
{
	set("short", "万府大门");
	set("long",
"走到这里，一座富丽堂皇的大宅院出现在你的眼前，两头
高大的石狮子镇住了大门两侧，朱漆大门足足有三寸厚。门上
挂着两个灯笼，写着「" HIY "荆州万府" NOR "」四个金漆大字。只见两个衣
衫华丽的青年站在大门两侧，警惕地注视着行人。\n");
        set("no_fight", 1);
        set("no_sleep_room", 1);
	set("exits", ([
		"south" : __DIR__"xidajie1",
		"north" : __DIR__"dayuan",
	]));
        set("objects", ([
                "/d/shaolin/npc/shang2" : 2,
        ]));
	setup();
}

int valid_leave(object me, string dir)
{
        if (dir == "north" &&
           objectp(present("jia ding", environment(me))))
                return notify_fail(CYN "家丁拦住你骂道：什么东西，居然连万"
                                   "老爷的府邸都敢乱闯！\n" NOR);                
        return ::valid_leave(me, dir);
}
