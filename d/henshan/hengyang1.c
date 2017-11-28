inherit ROOM;

void create()
{
	set("short", "衡阳西街");
	set("long", @LONG
你走在碎石铺就的狭小街道上。只见街上时常有人持剑疾
行，似乎这里出了啥事了。南边是一家小店，北面一座大宇巍
峨，重檐叠瓦， 门口彩灯高悬，管家家丁好象都是武林中人。
LONG);
        set("outdoors", "henshan");

	set("exits", ([
	       "east"   : __DIR__"hengyang",
	       "west"   : __DIR__"hengyang11",
	       "south"  : __DIR__"shop",
	       "north"  : __DIR__"liufugate",
	]));

        set("no_clean_up", 0);

	setup();
	replace_program(ROOM);
}

