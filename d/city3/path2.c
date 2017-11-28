inherit ROOM;

void create()
{
	set("short", "浣花溪");
	set("long", @LONG
溪源转北，阵阵水响带着你来到草堂前。站在草堂照壁前
回首浣花溪，想象万红漂坠，少女清歌浣花时节，别是一
般滋味。北边就是万里桥西宅，百花潭北庄的杜甫草堂。
LONG);
        set("outdoors", "chengdu");
	set("exits", ([
		"north"  : __DIR__"caotang",
		"south"  : __DIR__"path1",
	]));
	set("no_clean_up", 0);
	setup();
	replace_program(ROOM);
}
