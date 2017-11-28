////Room: qixiang3.c

inherit ROOM;

void create ()
{
        set ("short", "麒祥街");
        set ("long", @LONG
麒祥街是长安城北一条东西向的大道，街面宽敞洁净，街上十分热
闹，人来人往川流不息。大街的两旁商家云集，大大小小的店铺比邻而
立。街的北边是一家赌场，出出入入的人有喜有忧。赌场的老板为了方
便客人，就又在麒祥街对面开了一家当铺。
LONG);
        set("exits", 
        ([ //sizeof() == 4
		"south" : __DIR__"dangpu",
        	"north" : __DIR__"duchang",
        	"west" : __DIR__"qixiang2",
        	"east" : __DIR__"beian-daokou",
        ]));

        set("outdoors", "changan");
        setup();
        replace_program(ROOM);
}
