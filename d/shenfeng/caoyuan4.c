inherit ROOM;

void create()
{
	set("short", "戈壁");
	set("long", @LONG
此处地势与大漠的其余地方截然不同，遍地黄沙中混着粗
大石砾，丘壑处处，乱岩嶙嶙，路十分的崎岖难行。
LONG);
        set("outdoors", "xiyu");
        set("exits", ([
  		"west" : __DIR__"caoyuan5",
  		"east" : __DIR__"caoyuan3",
	]));

	setup();
	replace_program(ROOM);
}
