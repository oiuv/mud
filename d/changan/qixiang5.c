//Room: qixiang5.c

inherit ROOM;

void create ()
{
        set ("short", "麒祥街");
        set ("long", @LONG
麒祥街是长安城北一条东西向的大道，街面宽敞洁净，街上十分热
闹，人来人往川流不息。大街的两旁商家云集，大大小小的店铺比邻而
立。北边是一家首饰店，南边就是长安城有名的河洛镖局。
LONG);
        set("exits", 
        ([ //sizeof() == 4
		"south" : __DIR__"biaoju-damen",
        	"north" : __DIR__"shoushi-dian",
        	"west" : __DIR__"qixiang4",
       		"east" : __DIR__"qixiang6",
        ]));

        set("outdoors", "changan");
        setup();
        replace_program(ROOM);
}
