inherit ROOM;

void create()
{
	set("short", "蜀都道");
	set("long", @LONG
这里是蜀都大道，向西就可以到提督府了。过往的车马卷
起阵阵尘土，来去的官差阵步如飞，一些官兵在路上巡哨。你
感到一点点害怕，真后悔拐进这里来。
LONG);
        set("outdoors", "chengdu");
	set("exits", ([
	    	"east"  : __DIR__"eastroad2",
	    	"west"  : __DIR__"guangchang",
	]));

	set("objects", ([
	    	"/d/city/npc/bing" : 2,
	]));

	setup();
	replace_program(ROOM);
}
