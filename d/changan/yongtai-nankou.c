//Room: yongtai-nankou.c

inherit ROOM;

void create ()
{
        set ("short", "永泰南口");
        set ("long", @LONG
华瑞街和永泰大道的交叉口，一根三丈多高的旗杆之上，挑起了四
盏斗大的灯笼，每当暮色降临，这里灯火通明。南面是一家包子铺，北
方通向永泰大道。
LONG);
        set("exits", 
        ([ //sizeof() == 1
        	"east" : __DIR__"huarui1",
        	"north" : __DIR__"yongtai-dadao5",
        	"south" : __DIR__"baozipu"
        ]));

        set("outdoors", "changan");  
        setup();
	replace_program(ROOM);
}
