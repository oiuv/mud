inherit ROOM;

void create()
{
      set("short", "青石阶");
      set("long", @LONG
快到峨嵋山了。这是一条通往峨嵋山的青石阶，两旁绿树
荫蔽，空气十分清新。时常能见到些游人香客。
LONG);
      set("objects", ([
               __DIR__"npc/youngwoman": 1,
               __DIR__"npc/puren": 1,
      ]));
      set("outdoors", "emei");
      set("exits",([
          "north"      : __DIR__"xiaolu2",
          "west"       : "/d/city3/road1",
          "southwest"  : __DIR__"qsjie2",
      ]));
      setup();
      replace_program(ROOM);
}
