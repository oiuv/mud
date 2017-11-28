inherit ROOM;

void create()
{
	set("short", "白马客栈");
	set("long", @LONG
这是洛阳城里最大的一家客栈，紧靠洛阳中心，以洛阳的名胜白马寺
来命名，曰“白马客栈”，由于价格公道，因此到这里来借宿的客人川流
息，络绎不绝，生意及其兴隆，大堂内摆了七八张桌子，店小二跑来跑去
接待着从四面八方来的客人。二楼上是雅厅，客栈后面是马厩。
LONG);
        set("no_fight", 1);
        set("valid_startroom", 1);
        set("no_sleep_room",1);
	set("no_clean_up", 0);
	set("exits", ([
  		"east" : __DIR__"majiu",
  		"up" : __DIR__"kezhan2",
  		"west" : __DIR__"sroad1",
	]));
        set("objects", ([
                "/d/city/npc/xiaoer2" : 1,
        ]));
	setup();
	replace_program(ROOM);
}
