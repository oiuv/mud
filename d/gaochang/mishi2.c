inherit ROOM;

void create()
{
        set("short", "地下室");
        set("long", @LONG
这里是高昌迷宫后殿底下的地下密室。密室虽小，却也五
脏俱全，石桌石椅，石几石床，连室内放的几件器皿，也都是
石制的。看来似乎很久以前有人在这里住过。正中的石桌上平
放着一块薄薄的石板，上面好象刻着些什么。
LONG);
		set("exits", ([
			"south" : __DIR__"mishi",
		]));
        set("maze", 1);
        "/clone/book/lbook5"->foo();
        setup();
        replace_program(ROOM);
}
