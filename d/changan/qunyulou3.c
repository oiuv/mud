//Room: qunyulou3.c

inherit ROOM;

void create()
{
        set("short", "群玉楼三楼");
        set("long", @LONG
群玉楼三楼。这是一座三层高的小楼，本来是某一位大亨陪同夫人
赏月之处，现在已被群玉楼用重金买下。只听一声声划拳行令，加杂着
女人的娇笑，不时的从房间中传出。
LONG);
        set("exits", ([ /* sizeof() == 5 */
        	"north" : __DIR__"qunyuys5",
        	"south" : __DIR__"qunyuys6",
        	"west"  : __DIR__"qunyuys7",
        	"east"  : __DIR__"qunyuys8",
        	"down"  : __DIR__"qunyulou2",
        ]));

	setup();
        replace_program(ROOM);
}