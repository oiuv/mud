inherit ROOM;

void create()
{
	set("short", "易溪部");
	set("long", @LONG
易溪部也是乌夷族乌杂蛮的部落。这里处半坡地，附近有不少农
田，但农业落后，需要换季轮耕，因而村民经常迁徙，镇子里除了祭
祀大屋外，其它房屋都很简陋。
LONG);
	set("outdoors", "dali");
	set("exits", ([
                "northwest" : __DIR__"atoubu",
                "south"     : __DIR__"wuyiminju4",
                "east"      : __DIR__"biluoshan",
	]));
	set("objects", ([
                __DIR__"npc/shaonu": 1,
                "/clone/npc/walker" : 1,
	]));
	setup();
	replace_program(ROOM);
}

