#include <ansi.h>
inherit ROOM;

void create()
{
        set("short", "大堂二进");
        set("long", @LONG
这里是大堂的第二重，是全真教弟子做功课的所在。现在
还不到功课时间，大堂里空荡荡的，只有全真教掌管上下杂事
的掌理道长带领着几个小道童在整理桌椅，预备餐饭。
LONG);
        set("exits", ([
                "east" : __DIR__"datang3",
                "west" : __DIR__"datang1",
                "north" : __DIR__"cetang",
                "south" : __DIR__"piandian",
        ]));
        set("objects",([
                __DIR__"npc/zhangli" : 1,
                __DIR__"npc/daotong1" : 1,
        ]));
        setup();
        replace_program(ROOM);
}
