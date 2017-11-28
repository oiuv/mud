// Room: xiuxishi.c

inherit ROOM;

void init();

void create()
{
        set("short", "休息室");
        set("long", @LONG
这是间整洁的小房，房里别无他物，只有中间放着一张收拾得干
干净净的床，这是神龙岛弟子的休息场所。
LONG );
	set("exits", ([
	    "south"  : __DIR__"zoulang",
	]));

        set("sleep_room", 1);
        set("no_fight", 1);

        setup();
	replace_program(ROOM);
}

