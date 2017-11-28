inherit ROOM;

void create()
{
	set("short", "真趣亭");
	set("long", @LONG
亭内高高悬挂御笔题写的“真趣”匾一块。亭内装饰精致
金碧辉煌。梁架、围屏、裙板上雕刻的人物、花鸟图案惟妙惟
肖。在此可以环览全园景色。
LONG );
	set("outdoors", "suzhou");
	set("no_clean_up", 0);
	set("exits", ([
		"east"  : __DIR__"wenmeige",
		"north" : __DIR__"yanyutang",
	]));
        set("objects", ([
                "/clone/npc/walker" : 1,
        ]));
	setup();
	replace_program(ROOM);
}

