inherit ROOM;

void create()
{
	set("short", "女浴池");
	set("long", @LONG
这里热气腾腾，烟雾袅绕，一切都在朦胧之中，无法看个真切，微波
粼粼，肉光闪动，你睁大眼睛仔细一看，发觉这个世界上身材苗条的女子
真是多耶！再看看自己，不禁相形见绌。惭愧惭愧，还是赶快找个地方洗
澡吧！
LONG);
	set("no_clean_up", 0);
	set("exits", ([
  		"west" : __DIR__"rest2",
	]));
        set("objects", ([
                "/d/kaifeng/npc/obj/zaopeng" : 2,
        ]));
	setup();
	replace_program(ROOM);
}
