// Room: /d/hengshan/xuankong2.c
// Date: CSWORD 96/03/25

inherit ROOM;

void create()
{
	set("short", "悬空寺南楼");
	set("long", @LONG
这里是悬空寺的南门楼，也是南碑亭。悬空寺于陡崖上凿石穴
插悬梁为基，楼宇间栈桥相连。全寺面东座西，南北危楼对望，断
崖分断，很是艰险。
LONG
	);
	set("exits", ([
		"north"   : __DIR__"zhanqiao",
		"southup" : __DIR__"zhandao",
	]));
        set("no_clean_up", 0);
	setup();
        replace_program(ROOM);
}

