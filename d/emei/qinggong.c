inherit ROOM;

void create()
{
      set("short", "峨嵋寝宫");
      set("long", @LONG
这是峨嵋山金顶华藏庵外的一片小树林峨嵋寝宫。
LONG);
      set("objects", ([
           CLASS_D("emei") + "/zhou" : 1,
      ]));
      set("exits", ([
          "south" : __DIR__"xiaoshulin4", 
      ]));
      setup();
      replace_program(ROOM);
}
