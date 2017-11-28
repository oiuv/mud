#include <ansi.h>
inherit ROOM;

void create()
{
        set("short", "逍遥洞");
        set("long", @LONG
这是一个粗糙的石洞，里面铺了几张臭哄哄的草垫子。垫
子旁边是一些破酒罐子。洞壁(wall)上有些字迹。
LONG);
        set("sleep_room", 1);
        set("no_fight", 1);
        set("exits", ([
                "out" : __DIR__"xxh6",
        ]));
        set("item_desc", ([
                "wall" : HIW "\n           星宿淫贼人人得而株之！\n\n" NOR,
        ]) );
        setup();
        replace_program(ROOM);
}

