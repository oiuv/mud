//Room: qunyulou2.c

inherit ROOM;

void create()
{
        set("short", "群玉楼二楼");
        set("long", @LONG
群玉楼二楼。这是一座三层高的小楼，本来是某一位大亨陪同夫人
赏月之处，现在已被群玉楼用重金买下。只听一声声划拳行令，加杂着
女人的娇笑，不时的从房间中传出。
LONG);
        set("exits", ([ /* sizeof() == 6 */
        	"north" : __DIR__"qunyuys1",
        	"south" : __DIR__"qunyuys2",
        	"west"  : __DIR__"qunyuys3",
        	"east"  : __DIR__"qunyuys4",
        	"down"  : __DIR__"qunyulou1",
        	"up"    : __DIR__"qunyulou3",
        ]));

	setup();
        replace_program(ROOM);
}