//Room: liande-beikou.c

inherit ROOM;

void create ()
{
        set ("short", "连德北口");
        set ("long", @LONG
麒祥街的东尽头，一根三丈多高的旗杆之上，挑起了四盏斗大的灯
笼，每当暮色降临，这里灯火通明。北面有一座竹棚，里面隐隐传来唱
戏的声音。南方通向连德大道。
LONG);
        set("exits", 
        ([ //sizeof() == 3
        	"west" : __DIR__"qixiang6",
        	"north" : __DIR__"xiyuan",
        	"south" : __DIR__"liande-dadao1"
        ]));

        set("outdoors", "changan");  
        setup();
	replace_program(ROOM);
}
