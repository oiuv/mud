inherit ROOM;

void create()
{
	set("short", "星星峡");
	set("long", @LONG
远处出现了一抹岗峦。转眼之间，石壁越来越近，一字排
开，直伸出去，山石间云雾瀰漫，似乎其中别有天地，再走近
时忽觉峭壁中间露出一条缝来，沿山道直走进去，便是甘肃和
回疆之间的交通孔道星星峡。
LONG);
        set("outdoors", "shenfeng");
	set("exits", ([
  		"west" : __DIR__"xingxing2",
  		"east" : __DIR__"guandao4",
	]));
        set("objects", ([
                __DIR__"npc/seller" : 1,
        ]));
	setup();
	replace_program(ROOM);
}
