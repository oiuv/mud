inherit ROOM;
void create()
{
	set("short", "石砾小径");
	set("long", @LONG
此处地势与大漠的其余地方截然不同，遍地黄沙中混着粗
大石砾，丘壑处处，乱岩嶙嶙，山峰虽似触手可及，路竟是十
分的崎岖难行。
LONG);
        set("outdoors", "shenfeng");
	set("exits", ([
		"east" : __DIR__"lvzhou",
		"north" : __DIR__"bridge1",
	]));

	setup();
	replace_program(ROOM);
}
