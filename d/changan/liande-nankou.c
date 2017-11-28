//Room: liande-nankou.c

inherit ROOM;

void create ()
{
        set ("short", "连德南口");
        set ("long", @LONG
华瑞街的东尽头，一根三丈多高的旗杆之上，挑起了四盏斗大的灯
笼，每当暮色降临，这里灯火通明。南面有一家小酒馆，里面隐隐传来
划拳行令的声音。北方通向连德大道。
LONG);
        set("exits", 
        ([ //sizeof() == 3
        	"west" : __DIR__"huarui6",
        	"north" : __DIR__"liande-dadao5",
        	"south" : __DIR__"xiaojiuguan"
        ]));

        set("outdoors", "changan");  
        setup();
	replace_program(ROOM);
}
