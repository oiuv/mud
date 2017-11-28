inherit ROOM;

void create()
{
      set("short", "小路");
      set("long", @LONG
这是四川与湖北的交界。一条静悄悄的小土路，两旁有疏
疏落落的农舍耕田，但路上行人很少，都匆匆赶路。
LONG);
      set("outdoors", "emei");
      set("exits", ([
          "west"      : __DIR__"xiaolu2",
          "northeast" : __DIR__"wdroad",
      ]));
      set("no_clean_up", 0);
      setup();
      replace_program(ROOM);
}
