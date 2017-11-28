inherit ROOM;

void create()
{
      set("short","小树林");
      set("long",@LONG
这是峨嵋山金顶华藏庵外的一片小树林。林中没有路，但
地上依稀有些足迹，似乎刚有人走过。
LONG);
      set("outdoors", "emei");
      set("exits", ([
          "southeast" : __DIR__"xiaoshulin4", 
          "north"     : __DIR__"xiaoshulin2", 
      ]));
      set("no_clean_up", 0);
      setup();
      replace_program(ROOM);
}
