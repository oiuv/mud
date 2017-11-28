#include <room.h>

inherit ROOM;

void create()
{
        set("short", "物品房");
        set("long", @LONG
这是物品房，一个大架子。上面放的整整齐齐，看来这里
的管家是很认真负责的，一些人正在跟管物品工具的青年说着
什么。
LONG);
        set("no_fight", 1);
        set("exits", ([
               "south" : __DIR__"guofu_lang4",
               "north" : __DIR__"guofu_lang6",
               "west" : __DIR__"guofu_shilu-1",
        ]));
        set("objects", ([
           	__DIR__"npc/wuxiuwen" : 1,
        ]));
        setup();
        replace_program(ROOM);
}
