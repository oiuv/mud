inherit ROOM;

void create()
{
      set("short", "神水庵");
      set("long", @LONG
神水庵位于宝掌峰下，庵前有大峨石和玉液泉，泉出石下
清澈无比，终年不涸。一株大海棠树已是数百苍龄，抱可数围
高达十余丈。旁边有福寿庵；由此西上中峰寺东下纯阳殿。
LONG);
      set("exits", ([
          "eastdown"  : __DIR__"chunyangdian",
          "westup"    : __DIR__"zhongfengsi",
          "south"     : __DIR__"fushouan",
      ]));
      set("outdoors", "emei");
      set("no_clean_up", 0);
      setup();
      replace_program(ROOM);
}
