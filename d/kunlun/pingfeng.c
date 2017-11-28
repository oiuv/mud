inherit ROOM;

void create()
{
	set("short", "石屏风");
        set("long",@long
这是一个巨大的屏风，用昆仑山特产的汗白玉雕成，屏风
上的图案是昆仑派的师祖昆仑三圣何足道挑战少林的风姿，英
姿挺拔，颇有一派宗师之象。屏风后面就是昆仑派的前厅了。
long);
        set("exits",([
		"north" : __DIR__"guangchang",
		"south" : __DIR__"qianting",
	]));

	set("outdoors", "kunlun");
	setup();
	replace_program(ROOM);
}
