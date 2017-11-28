//Room: qixiang4.c

inherit ROOM;

void create ()
{
        set ("short", "麒祥街");
        set ("long", @LONG
麒祥街是长安城北一条东西向的大道，街面宽敞洁净，街上十分热
闹，人来人往川流不息。大街的两旁商家云集，大大小小的店铺比邻而
立。北边是一家钱庄，可以听到叮叮当当的金银声音。
LONG);
        set("exits", 
        ([ //sizeof() == 4
		"south" : __DIR__"qunyulou",
        	"north" : __DIR__"bank",
        	"west" : __DIR__"beian-daokou",
        	"east" : __DIR__"qixiang5",
        ]));

        set("outdoors", "changan");
        setup();
        replace_program(ROOM);
}
