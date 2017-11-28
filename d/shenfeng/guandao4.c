inherit ROOM;

void create()
{
	set("short", "山路");
	set("long", @LONG
这是一条被人走出来的小山路，虽然不宽却是够一辆马车
通行。小路顺着山中较为平坦地带缓缓向西伸展。
LONG);
        set("outdoors", "shenfeng");
	set("exits", ([
		"west" : __DIR__"xingxing1",
		"east" : __DIR__"guandao3",
	]));

	setup();
	replace_program(ROOM);
}
