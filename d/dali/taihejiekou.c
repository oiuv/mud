//Room: /d/dali/taihejiekou.c
//Date: June. 29 1998 by Java

inherit ROOM;
void create()
{
	set("short","太和街口");
	set("long",@LONG
太和街连贯阳苜咩城南北门，延伸三里，是城内主要街道。街面
是由碗口大的彩色石块铺成，青兰紫绿，煞是好看。街上行人络绎不
绝。大道两边遍植松柏，满目苍翠。城内居民族裔繁杂，习俗各异，
饮食穿着无不异于中原。太学生们的朗朗之声透室可闻。北面出城门
有官道通中原。
LONG);
	set("outdoors", "dali");
	set("exits",([ /* sizeof() == 1 */
	    "north"   : __DIR__"paifang",
	    "south"   : __DIR__"center",
	    "east"    : __DIR__"taiheeast",
	    "west"    : __DIR__"sheguta",
	]));
	set("no_clean_up", 0);
	setup();
	replace_program(ROOM);
}

