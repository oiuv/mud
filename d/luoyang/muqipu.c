inherit ROOM;

void create()
{
	set("short", "鲁氏木器铺");
	set("long", @LONG
这是一家专售木器的小店，店面不大，却很整洁。所卖木器不过是些
木刀，木枪之类，鲁老板也整日闲逛，无所事事。但私下听说他有门祖传
手艺，确谁也没见过。
LONG);
	set("no_clean_up", 0);
	set("exits", ([
  		"east" : __DIR__"sroad7",
	]));
        set("objects", ([
                __DIR__"npc/lu" : 1,
        ]));
	setup();
	replace_program(ROOM);
}
