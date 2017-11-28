inherit ROOM;

void create()
{
      set("short", "大道");
      set("long", @LONG
你走在一条黄土飞扬的大道上，不时地有人挂剑跨马匆匆
而过。东北通向武当。
LONG);
      set("outdoors", "wudang");
      set("exits", ([
          "southwest" : __DIR__"xiaolu1",
          "northeast" : "/d/wudang/sanbuguan",
      ]));
      set("no_clean_up", 0);
      setup();
      replace_program(ROOM);
}
