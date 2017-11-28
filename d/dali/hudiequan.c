inherit ROOM;

void create()
{
	set("short","蝴蝶泉");
	set("long",@LONG
蝴蝶泉就显得更加清凉湿润，大量的蝴蝶，从四面八方汇
集在树荫下，花丛中，翩翩起舞，成千上万只彩蝶，欢聚一处
使这里变得花团锦簇。特别是在蝴蝶泉上，顺着那倒垂的扬柳
无数蝴蝶，一只咬着一只的尾部，形成千百个蝶串，人来不惊
投石不散，构成令人惊叹的奇观。
LONG);
	set("outdoors", "dali");
	set("exits", ([
	        "north"  : __DIR__"yuxuguanqian",
	        "east"   : __DIR__"xiaodao1",
	]));
	set("no_clean_up", 0);
	setup();
	replace_program(ROOM);
}

