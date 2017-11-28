inherit ROOM;

void create()
{
	set("short", "西城楼");
	set("long", @LONG
不觉你已到了中州的西城门。高高的城楼看上去坚不可摧。
西面有一楼梯可以上城楼的二层。据说这里守城的将军武功不
俗，而却很好比武。
LONG);
	set("no_clean_up", 0);
	set("exits", ([
  		"west" : __DIR__"xijiao",
  		"east" : __DIR__"yanling2",
  		"up" : __DIR__"chenglouup",
	]));
        set("objects", ([
                "/d/kaifeng/npc/guanbing" : 4,
                "/d/city/npc/wujiang" : 1,
                "/clone/npc/walker" : 1,
        ]));
	set("outdoors", "zhongzhou");

	setup();
	replace_program(ROOM);
}
