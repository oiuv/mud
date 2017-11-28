inherit ROOM;

void create()
{
	set("short", "市中心");
	set("long", @LONG
这是中州的市中心，两条街道在这里划个大十字。整个中
州就数着两条街道最热闹了。其间三教九流，行行色色的人来
来往往。南北一条宽敞的街道，一看就是刚刚修建好不久，路
牌清楚的写着「文定街」。东西那条街道要陈旧一点，一块路
牌上的字已看不太清，依稀刻着「延陵路」三个字。
LONG);
	set("outdoors", "zhongzhou");
	set("exits", ([
  		"east" : __DIR__"yanlingdong",
  		"south" : __DIR__"wendingnan1",
  		"west" : __DIR__"yanling",
  		"north" : __DIR__"wendingbei1",
	]));
        set("objects", ([
                "/clone/npc/walker" : 1,
        ]));
	setup();
}
