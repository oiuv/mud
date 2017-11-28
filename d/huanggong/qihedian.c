inherit ROOM;

void create()
{
	set("short", "清和殿");
	set("long", @LONG
这里是清和殿。西边是一条长长的走廊，通往后院。走廊上有几间卧房，
那里是宫中太监的住所。
LONG );
        set("outdoors", "huanggong");
	set("exits", ([
		"south" : __DIR__"tinglang3",
		"west" : __DIR__"zoulang1",
		"north" : __DIR__"houhuayuan",
	]));
	set("objects", ([
		__DIR__"npc/shiwei" :1,
		__DIR__"npc/taijian" :1,
	]));
//	set("no_clean_up", 0);
	setup();
}

int valid_leave(object me, string dir)
{
me->delete("huanggong/canenter");
return ::valid_leave(me, dir);
}
