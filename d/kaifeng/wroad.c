inherit ROOM;

void create()
{
        set("short", "西大街");
        set("long", @LONG
开封府内西面的主要交通要道，街道两边店铺林立，行人
车马如梭。小商贩们挑着担子来回吆喝。此地向东就是相国寺
的放生池，再向北过去不远，就能见到延庆观的大门了。
LONG
        );
        set("no_clean_up", 0);
        set("exits", ([
  		"north" : __DIR__"wroad1",
  		"eastup" : __DIR__"fangsheng",
	]));
        set("outdoors", "kaifeng");

        setup();
        replace_program(ROOM);
}
