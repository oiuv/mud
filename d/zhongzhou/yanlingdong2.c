inherit ROOM;

void create()
{
  	set ("short", "延陵东路");
  	set ("long", @LONG
这是中州的一条老路延陵路。它东西横跨中州城。再往东
就可以出中州城了。因到了城东了比较偏僻，这里的本地人大
都把房子租给外地的人住了。
LONG);

	set("outdoors", "zhongzhou");

  	set("exits", ([
    		"northwest" : __DIR__"yanlingdong1",
    		"east"  : __DIR__"dongmeng",
	]));

        set("objects",([
                __DIR__"npc/gugong":1,
                __DIR__"npc/laogugong":2,
        ]));

         setup();
        replace_program(ROOM);
}
