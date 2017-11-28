inherit ROOM;

void create()
{
        set("short", "小茅房");
        set("long", @LONG
在空地上搭起的一个小茅房。连遮挡的门都没有。就在平
地上挖了个大坑，上面铺上两块木板。嗡嗡的苍蝇围着你乱转。
一股臭味熏得人直想逃出去，北面是片菜地，东面是个粪窖。
LONG
        );
        set("no_clean_up", 0);
        set("exits", ([
  		"north" : __DIR__"caidi5",
  		"east" : __DIR__"fenjiao",
	]));

        setup();
        replace_program(ROOM);
}
