// Room: /d/hengshan/xuankong1.c
// Date: CSWORD 96/03/25

inherit ROOM;

void create()
{
	set("short", "悬空寺北楼");
	set("long", @LONG
这里是悬空寺的北门楼，也是北碑亭。登楼俯视，如临深渊，
谷底仰望，如壁间丹凤。向南有悬空栈桥通往南楼。
LONG
	);
	set("exits", ([
		"south"    : __DIR__"zhanqiao",
		"up"       : __DIR__"sanjiaodian",
		"westdown" : __DIR__"cuiping2",
	]));
	set("objects", ([
		__DIR__"npc/yafu" : 1,
	]));
//        set("no_clean_up", 0);
	setup();
        replace_program(ROOM);
}

