inherit ROOM;

void create()
{
      set("short", "二天门");
      set("long", @LONG
这里是「二天门」，金光灿灿的金顶就在眼前了。
LONG);
      set("exits", ([
          "northdown": __DIR__"toutiangate",
          "southup"  : __DIR__"santiangate",
      ]));
      set("outdoors", "wudang");
      set("no_clean_up", 0);
      setup();
      replace_program(ROOM);
}
