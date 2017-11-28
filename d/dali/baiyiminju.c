inherit ROOM;
void create()
{
	set("short","摆夷民居");
	set("long",@LONG
摆夷是大理第一大族，大多散布在苍山洱海附近。摆夷
民居是以石块垒成，别局风格。朝花节那天，家家户户都把
盆栽花木摆在门口，摆搭成一座座的「花山」，招引四野乡
村的人来观花街。
LONG);
	set("objects", ([
	   	__DIR__"npc/oldman": 1,
	   	__DIR__"npc/girl1": 2,
	]));
	set("exits", ([
	    	"north"  : __DIR__"dahejieeast",
	]));
	setup();
	replace_program(ROOM);
}

