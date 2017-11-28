inherit ROOM;

void create()
{
	set("short", "石阶");
        set("long", @LONG
你走在青石板铺成的石阶上。这里就是传说中神秘的白驼
山。远远望去，两座白沙堆积形成的山峰好像一只骆驼的脊背。
一座山门立在你的眼前。
LONG);
	set("exits", ([
		"east"      : __DIR__"caoping",
		"northup"   : __DIR__"damen",
		"southdown" : __DIR__"guangchang" ,
	]));
	set("outdoors", "baituo");
	setup();
	replace_program(ROOM);
}
