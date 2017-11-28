//room: didao2.c
inherit ROOM;

void create()
{
  set("short","秘道");
  set("long", @LONG
你来到了一条秘道，看样子它不太平常，若隐若显的几盏油
灯，昏暗如豆但是看上去前方似有光亮，你要是觉得害怕，现在
回头还是可以的，不过这异常的幽静却也极大激发了你的好奇心，
大丈夫死又何足道载，真是勇气可佳。
LONG );

  set("exits",([
      "down" : __DIR__"mishi",
      "west" : __DIR__"didao1", 
      "south" : __DIR__"didao5",
  ]));
  set("no_clean_up", 0);
  setup();
  replace_program(ROOM);
}
