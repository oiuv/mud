inherit ROOM;

void create()
{
  	set ("short", "延陵东路");
  	set ("long", @LONG
这是中州的一条老路延陵路。它东西横跨中州城。路北的
一片房子看是虽然不是很新，可一看就知道是大户人家。两个
家丁叉腰守着门口，仿佛可到这户人家做家丁是很了不起的事。
LONG);
	set("outdoors", "zhongzhou");

  	set("exits", ([
    		"west" : __DIR__"yanlingdong",
    		"north" : __DIR__"yuanwan",
    		"southeast"  : __DIR__"yanlingdong2",
	]));

        set("objects" , ([
                __DIR__"npc/jiading" : 1,
                "/clone/npc/walker" : 1,
        ]));
        setup();
        replace_program(ROOM);
}
