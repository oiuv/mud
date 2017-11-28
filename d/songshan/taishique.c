
inherit ROOM;

void create()
{
	set("short", "太室阙");
	set("long", @LONG
嵩山古称方外，又称崇山，为五岳中的中岳，由太室少室
二山沿绵而成。汉武帝时称之为「嵩高」，取自诗经「嵩岳维
高，峻极于天」，道教以之为第六小洞天。阕高丈余，南面刻
「中岳太室阳城」六字，篆文古朴，苍劲有力。向西就是去少
室山少林寺的路，北走一里许便是中岳庙了，南面有一小屋。
LONG );
	set("exits", ([
		"north" : __DIR__"tianzhongge",
		"east"  : "/d/shaolin/ruzhou",
		"west"  : "/d/shaolin/shijie1",
                "south" : "/d/kaifeng/shanlu2",
	]));
	set("outdoors", "songshan");
	setup();
	replace_program(ROOM);
}

