inherit ROOM;

void create()
{
	set("short", "洛阳中心广场");
	set("long", @LONG
你脚下站的就是赫赫有名的古都洛阳，虽然国家正处于连年战乱灾荒，
民不聊生，但是丝毫不能掩饰这里的繁华，一条条宽敞明净的大道，熙熙
攘攘的人群，热闹的集市，充分展示了这座最古老的城市的生机。街上满
是来这里观光游览的游客，想必吸引他们的是大名鼎鼎的洛阳唐三彩和中
国第一古刹白马寺吧！当然建在这里的洛阳行宫也是许多别处的官员常来
膜拜的地方，而金刀王家的大名更是引来了无数的武林人士的拜访。广场
上好像刚刚下过雨，空气很清新，地上湿漉漉的，整个广场给人的感觉就
是古老而富有生机，就像是这座古城的一个缩影。
LONG);
        set("outdoors", "luoyang");
        set("no_clean_up", 0);
        set("exits", ([
  		"east" : __DIR__"eroad1",
  		"north" : __DIR__"nroad1",
  		"south" : __DIR__"sroad1",
  		"west" : __DIR__"wroad1",
	]));
        set("objects", ([
                "/d/taishan/npc/jian-ke" : 1,
                "/d/beijing/npc/maiyi2" : 1,
                "/d/beijing/npc/girl4" : 1,
                "/d/beijing/npc/old1" : 1,
                "/clone/npc/walker" : 1,
        ]));
	setup();
	replace_program(ROOM);
}
