inherit ROOM;

void create()
{
        set("short", "朱雀门");
        set("long", @LONG
这是内城的城门，高大的城墙用大青砖弥合米汁而成，时
间的冲刷使得墙砖变为铁青色。东西两边是角楼，南面不远处
就是大相国寺的八宝琉璃殿。
LONG);
        set("no_clean_up", 0);
        set("exits", ([
  		"south" : __DIR__"road",
  		"north" : __DIR__"road2",
  		"westup" : __DIR__"jiaolou",
  		"eastup" : __DIR__"jiaolou2",
	]));
        set("objects", ([
  		__DIR__"npc/guanbing" : 2,
                "/clone/npc/walker" : 1,
        ]));
        set("outdoors", "kaifeng");

        setup();
        replace_program(ROOM);
}
