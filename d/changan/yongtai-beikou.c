//Room: yongtai-beikou.c

inherit ROOM;

void create ()
{
        set ("short", "永泰北口");
        set ("long", @LONG
麒祥街的西尽头，一根三丈多高的旗杆之上，挑起了四盏斗大的灯
笼，每当暮色降临，这里灯火通明。北面是一家珠宝行，里面隐隐散出
诱人的珠光宝气，很多妇人路过这里都不免要往里瞧一瞧。南方通向永
泰大道。
LONG);
        set("exits", 
        ([ //sizeof() == 1
        	"east" : __DIR__"qixiang1",
        	"north" : __DIR__"zhubaohang",
        	"south" : __DIR__"yongtai-dadao1"
        ]));

        set("outdoors", "changan");  
        setup();
	replace_program(ROOM);
}
