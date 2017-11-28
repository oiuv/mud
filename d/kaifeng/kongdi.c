inherit ROOM;

void create()
{
        set("short", "空地");
        set("long", @LONG
在满园的菜地中间的一片空地，估计是因为原来的菜地被
踩平后，僧人不耐烦再种而留下来的。场地的中间一住老槐树
枝叶颤颤的，上面的老鸦不时惊叫。南边是个小粪窖，东面有
间小堂间。
LONG);
        set("no_clean_up", 0);
        set("exits", ([
  		"west" : __DIR__"caidi5",
  		"south" : __DIR__"fenjiao",
  		"east" : __DIR__"tangjian",
	]));
        set("outdoors", "kaifeng");

        setup();
        replace_program(ROOM);
}
