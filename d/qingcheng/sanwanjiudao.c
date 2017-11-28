// Room: /qingcheng/sanwanjiudao.c
// Date: Frb.20 1998 by Java

inherit ROOM;
void create()
{
	set("short", "三弯九倒");
	set("long", @LONG
山势越来越陡峭，石梯几近壁立，拐过观日亭，远远看到青城
山巅，高台山之阳的飞檐流瓦，上清宫到了。
LONG );
        set("outdoors","qingcheng");
	set("exits", ([
		"southdown"  : __DIR__"chaoyangdong",
		"eastup"    : __DIR__"shangqing",
	]));
        set("no_clean_up", 0);
	setup();
	replace_program(ROOM);
}

