//Room: taiziyan.c 太子岩
//Date: Sep 22 1997

inherit ROOM;

void create()
{
      set("short","太子岩");
      set("long",@LONG
这里是群山环抱中的太子岩，岩上有一块三清石和一座太子亭。
LONG);
      set("exits",([ /* sizeof() == 1 */
           "northdown":__DIR__"shanlu4",
          "southdown": __DIR__"langmeiyuan",
      ]));
      set("outdoors", "wudang");
      set("no_clean_up", 0);
      setup();
      replace_program(ROOM);
}
