inherit ROOM;

void create()
{
	set("short", "当铺");
	set("long", @LONG
这是洛阳城里最大的一家当铺了，素来以买卖公平着称。门帘上绣了
个大大的“當“字，使人一目了然。当铺门口横摆着一个五尺来高的柜台，
将当铺内的一切当了个严严实实，上面摆着一个牌子 (paizi)。这里成了
那些手头不宽裕的人常来的地方。
LONG);
	set("no_clean_up", 0);
	set("exits", ([
  		"down" : __DIR__"cunchu",
  		"east" : __DIR__"sroad1",
	]));
        set("item_desc", ([
                "paizi" : "公平交易\n
sell        卖 
buy         买
redeem      赎
value       估价
",
        ]));
        set("objects", ([
                __DIR__"npc/qi" : 1,
        ]));
	setup();
	replace_program(ROOM);
}
