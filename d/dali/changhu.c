//Room: /d/dali/changhu.c
//Date: June. 29 1998 by Java

inherit ROOM;
void create()
{
	set("short","长湖");
	set("long",@LONG
长湖，周长约十余里，湖面呈狭长形，故名。在密密的丛林中。
它宛如一弯新月，在蓝天中辉耀。湖周松柏成林，苍翠欲滴，芳草萋
萋，色鲜叶嫩，间有山花，点缀其间。湖水碧绿，似一幅在微风中抖
动的锦缎，绿的晶莹，绿的活跃，绿的醉人。
LONG);
	set("outdoors", "dali");
	set("exits",([ /* sizeof() == 1 */
	    "southdown"  : __DIR__"shilin",
	    "west"       : __DIR__"shilin1",
	    "northeast"  : __DIR__"shilin2",
	    "enter"      : __DIR__"hole",
	]));
	set("no_clean_up", 0);
	setup();
	replace_program(ROOM);
}

