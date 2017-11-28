// Room: /t/wanjiegu/bed_room.c

inherit ROOM;

void create()
{
        set("short", "卧室");
        set("long", @LONG
这是钟谷主的卧室，室内大红的帏帐挂在大红的木床之上。墙
上贴满了各种花花绿绿的东西。床边有个小柜，柜上放着一盏豆油
灯。
LONG
        );
        set("exits", ([ /* sizeof() == 1 */
            "south" : __DIR__"left_room",
        ]));
        set("objects", ([
            __DIR__"npc/zhongling" : 1,
        ]));
//        set("no_clean_up", 0);

        setup();
        replace_program(ROOM);
}
