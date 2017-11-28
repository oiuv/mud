//room: didao5.c
inherit ROOM;

void create()
{
  set("short","秘道");
  set("long", @LONG
走在里面，你不觉想到这似乎在每个角落都藏着无限杀机，
你感到近了近了，越来越近了。
LONG );

  set("exits",([
      "east" : __DIR__"didao3",
      "west" : __DIR__"didao3",
      "north" : __DIR__"didao4",
      "south" : __DIR__"didao1",
  ]));
  set("no_clean_up", 0);
  setup();
  replace_program(ROOM);
}
