// Room: /d/hengshan/cuipinggu1.c
// Date: CSWORD 96/03/25

inherit ROOM;

void create()
{
	set("short", "翠屏谷");
	set("long", @LONG
浑河在谷中冲刷而过，天峰岭和翠屏山分列峡谷两侧，绝壁千
仞，犹如刀削斧劈，高耸入云，这里自古就是塞外通往内地的咽喉
要道，真有一夫当关万夫莫开之势。
LONG
	);
	set("exits", ([
		"southeast"  : __DIR__"cuipinggu2",
		"northwest"  : __DIR__"jinlongxia",
	]));
	set("objects", ([
		__DIR__"npc/wen" : 1,
	]));
	set("outdoors", "hengshan");
//        set("no_clean_up", 0);
	setup();
        replace_program(ROOM);
}

