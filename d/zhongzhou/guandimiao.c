inherit ROOM;

void create()
{
	set("short", "破庙");
        set("long", @LONG
这是小巷中的一座破庙，许多残破的青砖散落在地下，从
墙洞中露出的一根大柱子已看不出本来的颜色，几个叫花子懒
散的躺在门口。
LONG);

        set("exits", ([  
                "southeast" : __DIR__"xiaoxiang1",          
		"enter":__DIR__"inpomiao",
        ]));
        set("objects",([
                "/d/kaifeng/npc/qigai" : 2,
        ]));

        setup();
        replace_program(ROOM);
}
