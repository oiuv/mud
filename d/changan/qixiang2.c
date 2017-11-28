//Room: qixiang2.c

inherit ROOM;

void create ()
{
        set ("short", "麒祥街");
        set ("long", @LONG
麒祥街是长安城北一条东西向的大道，街面宽敞洁净，街上十分热
闹，人来人往川流不息。大街的两旁商家云集，大大小小的店铺比邻而
立。街的北边熙熙攘攘的是一家茶馆，茶馆的对面是一家水果店。
LONG);
        set("exits", 
        ([ //sizeof() == 4
		"south" : __DIR__"fruit-shop",
        	"north" : __DIR__"tea-shop",
        	"west" : __DIR__"qixiang1",
        	"east" : __DIR__"qixiang3",
        ]));

        set("outdoors", "changan");
        setup();
        replace_program(ROOM);
}
