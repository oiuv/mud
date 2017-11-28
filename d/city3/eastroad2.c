inherit ROOM;

void create()
{
	set("short", "东大街");
	set("long", @LONG
你走在东大街上，踩着坚实的青石板地面。东边是东城门
可以听到守城官兵的吆喝声。西边是蜀都大道，那边一派肃静
原来是因为提督府在那头。南北是一条宽直的大道。
LONG);
        set("outdoors", "chengdu");
	set("exits", ([
	    	"east"  : __DIR__"eastgate",
	    	"west"  : __DIR__"shuduroad1",
	    	"north" : __DIR__"eastroad1",
	    	"south" : __DIR__"eastroad3",
	]));
	set("objects", ([
	    	"/d/city/npc/liumangtou" : 1,
	    	"/d/city/npc/liumang"    : 2,
	]));
	setup();
	replace_program(ROOM);
}
