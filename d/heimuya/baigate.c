#include <ansi.h>
inherit ROOM;

void create()
{
        set("short", "白虎堂大门");
        set("long", @LONG
这是日月神教下第二大堂白虎堂的大门，门前摆放着两座
石狮，镇守着朱漆大门。大门两旁站着数名轻装弟子，双手握
着钢刀，警惕地注视着周围的一切。
LONG);
        set("outdoors", "heimuya");
        set("exits", ([
                "west" : __DIR__"dating2",
                "east" : __DIR__"baigate1",
        ]));
        set("objects", ([
                __DIR__"npc/dizi4" : 2,
        ]));
        setup();
}

int valid_leave(object me, string dir)
{
        if (objectp(present("riyue dizi", environment(me)))
           && dir == "west"
           && me->query("family/family_name") != "日月神教")
                return notify_fail(CYN "日月弟子将你拦住，说道：这里乃神"
                                   "教重地，他人不得入内。\n" NOR);

        return ::valid_leave(me, dir);
}
