inherit ROOM;

void create()
{
	set("short", "向阳巷");
	set("long", @LONG
这里是福州城西向阳巷。北面有一所破败的宅子。西面有
一家杂货铺，专卖女人家用的东西，男人不可以进去。
LONG );

	set("exits", ([
                "east"  : __DIR__"shiqiao",
                "north" : __DIR__"laozhai",
                "west"  : __DIR__"zahuopu",
	]));
	set("outdoors", "fuzhou");
	setup();
        replace_program(ROOM);
}
