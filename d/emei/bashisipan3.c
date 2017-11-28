inherit ROOM;

void create()
{
      set("short", "八十四盘");
      set("long", @LONG
八十四盘，道路艰险陡峭，迂回盘折，令人不能喘息。路
左是蔽日遮天的冷杉林，路右是深不见底的绝壁峡谷。由此往
上至接引殿，北下到洗象池。
LONG);
      set("outdoors", "emei");
      set("exits", ([
          "northdown"  : __DIR__"bashisipan2",
          "southeast"  : __DIR__"jieyindian",
          "northeast"  : __DIR__"lengsl4",
      ]));
      setup();
      replace_program(ROOM);
}
