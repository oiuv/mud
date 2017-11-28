#include <room.h>
inherit ROOM;

string look_gaoshi();

void create()
{
	set("short", "北门");
	set("long", @LONG
这是扬州城的北城门，因为曾经失火，到现在城墙还是黑
乎乎的，因此白纸黑字的官府告示 (gaoshi) 就显得特别现眼。
北方是一片崇山峻岭，一条黄土小径在山里蜿蜒而上。
LONG );
	set("item_desc", ([
		"gaoshi" : (:look_gaoshi:),
	]));
	set("exits", ([
		"south" : __DIR__"beidajie2",
		"north" : "/d/shaolin/yidao",
		"west"  : "/d/huanghe/caodi1",
	]));
        set("objects", ([
                "/kungfu/class/yunlong/ma" : 1,
                "/d/beijing/npc/ducha" : 1,
                __DIR__"npc/bing" : 4,
                "/clone/npc/walker" : 1,
        ]));
	set("outdoors", "city");
	setup();
	//replace_program(ROOM);
}

string look_gaoshi()
{
	return FINGER_D->get_killer() + "\n扬州知府\n程药发\n";
}

