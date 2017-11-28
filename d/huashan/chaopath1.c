inherit ROOM;

void create()
{
      set("short","朝阳峰小路");
      set("long",@LONG
这里是朝阳峰小路，山势陡峭，两边下临深谷，一不小心都会掉
了下去。
LONG);
      set("outdoors", "huashan");
      set("no_clean_up", 0);
      set("exits",([ /* sizeof() == 1 */
          "northeast": __DIR__"chaopath2",
          "southeast": __DIR__"square",
      ]));
      setup();
      replace_program(ROOM);
}

