#include <ansi.h>
inherit ROOM;

void create()
{
        set("short", "江边小路");
        set("long", @LONG
你走在长江边上的一条小路上，再往西走，就进入了绵绵
的四川山区了，东南方向有条小路，不知道通往哪里。
LONG);
        set("exits", ([
  		"east" :  __DIR__"shudao3",
  		"west" : __DIR__"shudao5",
   	]));
        set("no_clean_up", 0);
        set("outdoors", "chengdu");

        setup();
        replace_program(ROOM);
}

