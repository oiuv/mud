#include <ansi.h>
inherit ROOM;

void create()
{
        set("short", "江边小路");
        set("long", @LONG
你走在长江边上的一条小路上，耳听着江水哗哗的流，心
情也觉得好些，放眼向西看去，只见群山连绵，也不知道何处
才是归途。
LONG);
        set("exits", ([
  		"northeast" :  __DIR__"shudao2",
  		"west" : __DIR__"shudao4",
   	]));
        set("no_clean_up", 0);
        set("outdoors", "chengdu");

        set("objects", ([
                "/d/beijing/npc/boy2" : 1,
                "/d/beijing/npc/girl4" : 1,
        ]));
        setup();
        replace_program(ROOM);
}
