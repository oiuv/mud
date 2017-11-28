inherit ROOM;

void create()
{
	set("short", "衙门正厅");
	set("long", @LONG
这里便是衙门的正厅了，堂上东西有两根楹住，挂着一幅
对联，但是你无心细看。正墙上悬挂一个横匾，上书「正大光
明」四个金光闪闪的大字。知府正坐在文案后批阅文书，师爷
随侍在后。
LONG );
	set("exits", ([
		"east"  : __DIR__"dongting",
		"west"  : __DIR__"xiting",
		"north" : __DIR__"neizhai",
		"south" : __DIR__"yamen",
	]));
	set("objects", ([
		__DIR__"npc/cheng" : 1,
		__DIR__"npc/shiye" : 1,
	]));
	setup();
	replace_program(ROOM);
}

