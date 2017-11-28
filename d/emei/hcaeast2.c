inherit ROOM;

void create()
{
      set("short", "华藏庵东廊");
      set("long", @LONG
这里是峨嵋华藏庵东廊。走廊往南通往斋堂，北通往广场。
LONG);
      set("outdoors", "emei");
      set("exits", ([
          "south" : __DIR__"hcazhaitang", 
          "north" : __DIR__"hcaeast1", 
      ]));
      set("no_clean_up", 0);
      setup();
      replace_program(ROOM);
}
