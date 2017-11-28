inherit ROOM;

void create()
{
	set("short", "康府大厅");
	set("long", @LONG
这里就是康亲王府的大厅，相当的宽敞明亮，四周的墙上悬挂满了各朝名
人的真迹，正堂坐着一个衣着黄马褂，满面笑容的男子，那就是当今皇上的宠
臣康亲王了。两旁的座位分别坐着两个御前侍卫，从衣着上看来品位似乎不低。
大厅往北又是一条走廊，那是通往王府的内堂所在。
LONG );
	set("exits", ([
		"north" : __DIR__"kangfu_zoulang2",
		"south" : __DIR__"kangfu_zoulang1",
	]));
	set("objects", ([
		__DIR__"npc/kangqinwang" : 1,
		__DIR__"npc/zhangkang" : 1,
		__DIR__"npc/zhaoqi" : 1,
	]));
	set("outdoors", "beijing");
       setup();
	replace_program(ROOM);
}

