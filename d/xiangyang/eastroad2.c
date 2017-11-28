// Room: /d/xiangyang/eastroad2.c
// Date: Jan. 8 1999 by Winder

inherit ROOM;

void create()
{
	set("short", "东内大街");
	set("long", @LONG
这是一条青石铺就的大街。西面是一堵盖着红色琉璃瓦的
高墙，里面是襄阳守城大将王坚的府邸大院。东面是忠烈祠，
因为十余年来，为保卫襄阳、抵抗蒙古军的侵略而牺牲的人特
别多，前往上香祭奠的人络绎不绝。北面是一个十字街道，只
见人来人往，非常热闹，南面是用青石铺的街道。
LONG );
        set("outdoors", "xiangyang");

	set("no_clean_up", 0);
	set("exits", ([
		"east"  : __DIR__"zhonglie",
		"south" : __DIR__"eastroad1",
		"north" : __DIR__"jiekou2",
	]));
	setup();
	replace_program(ROOM);
}

