//RJQTING.C

inherit ROOM;

void create()
{
	set("short", "巨木旗大厅");
	set("long", @LONG
这是巨木旗的大厅，虽然都是练武之人，这里却布置得古
色古香。整个大厅就建在神木之中，树木掩映，极为严密。虽
然未免挤迫，却绝无外敌能轻易攻得上来。厅中充满茶香和古
木幽香，十分动人。掌旗使闻松神色自若地端坐喝茶，全不理
会客人的到来。巨木旗下在厅口准备了极多的巨木桩，专候来
敌。
LONG);
	set("exits", ([
		"down" : __DIR__"jmqshenmu",
	]));
        set("objects",([
                __DIR__"npc/wensong":1,
	]));
	setup();
	replace_program(ROOM);
}
