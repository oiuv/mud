//Room: qixiang6.c

inherit ROOM;

void create ()
{
        set ("short", "麒祥街");
        set ("long", @LONG
麒祥街是长安城北一条东西向的大道，街面宽敞洁净，街上十分热
闹，人来人往川流不息。大街的两旁商家云集，大大小小的店铺比邻而
立。北边是一家药店，往东就到了和连德大道交叉的连德北口。
LONG);
        set("exits", 
        ([ //sizeof() == 4
		"south" : __DIR__"weapon-shop",
        	"north" : __DIR__"yaopu",
        	"west" : __DIR__"qixiang5",
        	"east" : __DIR__"liande-beikou",
        ]));

        set("outdoors", "changan");
        setup();
        replace_program(ROOM);
}
