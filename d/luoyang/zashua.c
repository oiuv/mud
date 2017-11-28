inherit ROOM;

void create()
{
	set("short", "杂耍表演");
	set("long", @LONG
空旷的一块场地，中间有几个身强力壮的男子正在着表演、杂技、魔
术、武术、气功。引得人们争相观看，四周围满了人群，有老有少，有男
有女，不时的发出惊讶赞叹声。
LONG);
        set("outdoors", "luoyang");
        set("no_clean_up", 0);
        set("exits", ([
  		"south" : __DIR__"fengwei",
  		"east" : __DIR__"roudian",
	]));
        set("objects", ([
                "/d/beijing/npc/maiyi2" : 1,
                "/d/beijing/npc/maiyi1" : 1,
                "/d/beijing/npc/xianren" : 2,
                "/d/beijing/npc/boy2" : 1,
        ]));
	setup();
	replace_program(ROOM);
}
