inherit ROOM;

void create()
{
	set("short", "小胡同");
	set("long", @LONG
这里是洛阳城内老百姓的居住区。胡同内很安静，没有什么杂声。一
些居民从这里进进出出。越往胡同里走，一些全身穿着白色长衣的人就越
多了，只见这些人鬼鬼祟祟，眼神恍惚，行踪可疑，让人猜不透是干什么
的。
LONG);
        set("outdoors", "luoyang");
        set("no_clean_up", 0);
        set("exits", ([
  		"south" : __DIR__"hutong",
  		"north" : __DIR__"hutong3",
  		"west" : __DIR__"wanju",
	]));

	setup();
	replace_program(ROOM);
}
