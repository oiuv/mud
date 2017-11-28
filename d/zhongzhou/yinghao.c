inherit ROOM;

void create()
{
	set("short", "英豪酒楼");
	set("long", @LONG
这是中州城最大的酒楼，南来北往的过客都要在此歇歇脚
喝壶好酒。说不准还会交到一两个朋友。大厅挺宽敞，两根大
柱子上有几个斗大的字。要和朋友小聚，楼上还有雅座。据说
楼上还有休息室，专门为了那些有点贪杯的人准备的。
LONG);

        set("no_fight", 1);
        set("valid_startroom", 1);
        set("no_sleep_room",1);
 	set("exits", ([
		"west" : __DIR__"wendingbei1",
		"east" : __DIR__"majiu",
	        "up"   : __DIR__"yinghaoup",
	]));

        set("objects", ([
                "/d/city/npc/xiaoer2" : 1,
        ]));

	setup();
}
