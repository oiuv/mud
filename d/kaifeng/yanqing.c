inherit ROOM;

void create()
{
        set("short", "延庆观");
        set("long", @LONG
延庆观飞檐挑拱，气势磅礴。始建于元太宗五年，原名为
重阳观，为纪念道教中全真教创始人王吉在此传教并逝世于此
而修建。明洪武六年，改名延庆观。  
LONG);
        set("no_clean_up", 0);
        set("exits", ([
  		"west" : __DIR__"sanqing",
  		"east" : __DIR__"wroad2",
	]));
        set("objects", ([
                "/clone/npc/walker" : 1,
        ]));
        set("outdoors", "kaifeng");

        setup();
        replace_program(ROOM);
}
