inherit ROOM;

void create()
{
	set("short", "林荫道");
	set("long", @LONG
这是一条安静的林荫道，地上铺着奇奇怪怪五颜六色的石
子，向东西两头延伸。东面就是热闹的南大街了。西边有几个
小孩在玩耍，安静，和谐，微风吹来，使人忘却了江湖上的生
死情仇。
LONG);
        set("outdoors", "jingzhou");
        set("objects", ([
                "/d/beijing/npc/kid1" : 2,
        ]));
	set("exits", ([
		"eastup" : __DIR__"nandajie2",
		"west" : __DIR__"lydao3",
	]));

	setup();
	replace_program(ROOM);
}

