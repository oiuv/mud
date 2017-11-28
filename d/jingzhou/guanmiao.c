inherit ROOM;

void create()
{
	set("short", "关圣庙");
	set("long", @LONG
相传关老爷子旧年曾在这里和周仓争关庙首席之位。周仓
说提议谁先跑到庙里，谁就为大。关公答应后，待周仓跑到门
口大叫：别占我的门旮。周仓本是你说不，我偏要之人，往门
旮旮一站，关公也就到前面去了。这些不表，且看这庙里，香
火缭绕，长年不断，来进香的人络绎不绝，也可知关二爷在当
地人心中是多英雄的人物。
LONG);
	set("exits", ([
		"south" : __DIR__"xidajie2",
		"north" :__DIR__"houdian",
	]));
        set("objects", ([
                "/d/beijing/npc/xiangke" : 1,
        ]));
	setup();
	replace_program(ROOM);
}

