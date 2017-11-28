// Room: /guiyun/jinship.c
// Date: Nov.18 1998 by Winder

inherit ROOM;

void create()
{
	set("short", "金国战船");
	set("long", @LONG
这里是大金国钦使的战船，船中旗杆上分明扯着旗号，飞扬跋
扈已极。船舱内汉奸们一脸媚笑，金兵一个个都趾高气扬。
LONG );
        set("outdoors", "guiyun");
//	set("no_clean_up", 0);

	set("exits", ([
		"out" : __DIR__"ship",
	]));
	set("objects", ([
		"/d/huanghe/npc/peng" : random(2),
		"/d/huanghe/npc/sha" : random(2),
		"/d/huanghe/npc/liang" : random(2),
		"/d/huanghe/npc/hou" : random(2),
		"/d/huanghe/npc/ma" : random(2),
		"/d/huanghe/npc/qian" : random(2),
		"/d/huanghe/npc/shen" : random(2),
		"/d/huanghe/npc/wu" : random(2),
		"/kungfu/class/ouyang/ouyangfeng" : random(2),
		"/kungfu/class/ouyang/ouyangke" : random(2),
		__DIR__"npc/duantiande" : random(2),
		__DIR__"npc/wanyankang" : random(2),
		__DIR__"npc/wanyanhonglie" : random(2),
		__DIR__"npc/jinbing" : random(4),
	]));
	setup();
	replace_program(ROOM);
}
