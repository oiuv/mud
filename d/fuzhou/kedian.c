// Room: /d/fuzhou/kedian.c
// Date: May 12, 98  Java

inherit ROOM;

void create()
{
	set("short", "客店");
	set("long", @LONG
山野客店十分简陋。一个小二临台买卖，一片破门扇扑在地
上，显得相当忙乱。柜台上贴着个牌子(paizi)。
LONG );
	set("exits", ([
		"east" : __DIR__"erbapu",
	]));
	set("item_desc", ([
		"paizi" : "即日起只供应吃喝，不留宿。\n",
	]));
        set("valid_startroom", 1);
        set("no_sleep_room", 1);
        set("no_fight", 1);
	set("objects", ([
		__DIR__"npc/xiaoer2" : 1,
	]));
	setup();
	replace_program(ROOM);
}

