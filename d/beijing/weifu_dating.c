inherit ROOM;

void create()
{
	set("short", "韦府大厅");
	set("long", @LONG
这里就是鹿鼎公府的大厅，相当的宽敞明亮，四周的墙上悬挂满了各朝名
人的真迹。正厅中央坐着两个老者，较老的老者身旁边还站着一个老妇和一个
四十多岁的中年男子，那男子骨瘦如柴，不住的咳嗽。大厅北边是韦公爷的书
房，左右两边分别是两个厢房。
LONG );
	set("exits", ([
		"north" : __DIR__"weifu_shufang",
		"south" : __DIR__"weifu_zoulang2",
		"west" : __DIR__"weifu_fangw",
		"east" : __DIR__"weifu_fange",
	]));
	set("objects", ([
		__DIR__"npc/guixinshu" : 1,
		__DIR__"npc/guierniang" : 1,
		__DIR__"npc/guizhong" : 1,
		__DIR__"npc/liudahong" : 1,
	]));
	set("outdoors", "beijing");
       setup();
	replace_program(ROOM);
}

