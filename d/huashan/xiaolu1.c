//Room: xiaopath1.c 小山路
//Date: Oct. 2 1997 by Venus
inherit ROOM;

void create()
{
      set("short","小山路");
      set("long",@LONG
这里是华山的一条小山路，地势较为平缓，不似其它地方那么险
峻。你走在这里，四周静悄悄的，你就象走进了一个世外桃源。
LONG);
      set("outdoors", "huashan");
      set("exits",([ /* sizeof() == 1 */
          "southwest"     : __DIR__"yunu",
          "northeast"     : __DIR__"xiaolu2",
      ]));
      set("no_clean_up", 0);
      setup();
      replace_program(ROOM);
}
