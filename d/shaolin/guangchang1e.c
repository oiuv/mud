// Room: /d/shaolin/guangchang1e.c
// Date: CSWORD 96/02/28

inherit ROOM;

void create()
{
	set("short", "广场");
	set("long", @LONG
这里是少林寺前的广场，整个广场由大块的青石铺成，极为
平坦。但因年代久远，都有些破损。丛丛小草从石板的缝隙中长
了出来。广场周围都是密密的松树林，四角上各放了几块石碑，
字迹都甚为模糊。边上立了块木牌(mupai)，寺前三三两两的站着
几个僧人。
LONG );
	set("exits", ([
		"east" : __DIR__"shulin1",
		"southdown" : __DIR__"shijie11",
		"west" : __DIR__"guangchang1",
	]));
	set("item_desc",([
		"mupai"	:   "少林寺护法松林，违令擅入者杀无赦！\n",
	]));
	set("outdoors", "shaolin");
	set("objects",([
		CLASS_D("shaolin") + "/qing-wu" : 1,
	]));
//	set("no_clean_up", 0);
	setup();
}

int valid_leave(object me, string dir)
{
	if (!wizardp(me) 
	&& dir == "east" 
	&& me->query_skill("dodge",1) <= 20 
	&& (present("qingwu biqiu", environment(me))))

	return notify_fail("清无拦住劝你: 东边是本寺护法松林，向来有进无出，\n"
		    + RANK_D->query_respect(me) + "轻功不佳，最好先看看木牌，不要随便进去！\n");

	return ::valid_leave(me, dir);
}

