// Room: /guiyun/dating.c
// Date: Nov.18 1998 by Winder

inherit ROOM;

void create()
{
	set("short", "大厅");
	set("long", @LONG
这是归云庄的正厅，由于修建年代久远，看起来已颇为陈旧，
但打扫得十分干净，光线也较为充足，完全没有陈年旧宅的阴晦之
气。四壁挂着一些古人书画精品，皆为上乘之作，显得主人眼光不
凡，胸中大有丘壑。
LONG );
//      set("outdoors", "guiyun");
//	set("no_clean_up", 0);

	set("exits", ([
		"north" : __DIR__"huating",
		"south" : __DIR__"qianyuan",
		"east"  : __DIR__"shufang",
	]));
	set("objects", ([
		__DIR__"npc/kezhene" : 1,
		__DIR__"npc/zhucong" : 1,
		__DIR__"npc/hanbaoju" : 1,
		__DIR__"npc/nanxiren" : 1,
		__DIR__"npc/zhangasheng" : 1,
		__DIR__"npc/quanjinfa" : 1,
		__DIR__"npc/hanxiaoyin" : 1,
	]));
	setup();
	replace_program(ROOM);
}
