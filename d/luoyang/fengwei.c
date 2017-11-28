inherit ROOM;

void create()
{
	set("short", "风味小吃");
	set("long", @LONG
你的眼前突然出现了一家小吃店，大门外挂着一块牌子，牌子上写着
“风味小吃”四个字，到小吃店里来吃东西的人络绎不绝，在这家店里你
能吃到全国各地的风味小吃，南洋的小笼，天津的狗不理包子，北京的烤
鸭，嘉兴的五香豆，郑州的拉面等等，快来品尝一下吧！
LONG);
        set("outdoors", "luoyang");
        set("no_clean_up", 0);
        set("exits", ([
  		"north" : __DIR__"zashua",
  		"east" : __DIR__"wanju",
	]));
        set("objects", ([
                "/d/city/npc/xiaoer2" : 1,
        ]));
	setup();
	replace_program(ROOM);
}
