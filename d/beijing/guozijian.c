#include <room.h>
#include <ansi.h>
inherit ROOM;

void create()
{
        set("short", "国子监");
        set("long", @LONG
这里就是京城的国子监。国子监是朝廷培养人才的地方。高高低低的桌子
排了两排。在这里不时可以看到三三两两的学生模样的人大声争辩着什么问题，
还有一些老先生们蹙着眉头匆匆的走过，象是在思考着什么问题。
LONG NOR);
        set("exits", ([
                "south" : __DIR__"dong_2",
        ]));
        set("objects", ([
                __DIR__"npc/shusheng1" : 3,
        ]));
        set("outdoors", "beijing");
        setup();
        replace_program(ROOM);
}

