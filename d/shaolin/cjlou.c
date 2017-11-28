// Room: /d/shaolin/cjlou.c
// Date: YZC 96/01/19

inherit ROOM;

void create()
{
	set("short", "藏经阁一楼");
	set("long", @LONG
不愧为中原佛法的总源，少林寺此处藏经之富，天下罕有其
匹。这里都是密密麻麻，高及顶棚的书架，书架间仅有容身一人
通行的空隙。几排大书架中间，间隔地放着数丈长的书桌。目光
及处，你看到桌上放了几本佛经。
LONG );
	set("exits", ([
		"east" : __DIR__"zhulin5",
		"up" : __DIR__"cjlou1",
	]));
	set("objects",([
		CLASS_D("shaolin") + "/dao-yi" : 1,
                CLASS_D("shaolin") + "/wuming" : 1,
		"d/shaolin/obj/fojing1"+random(2) : 1,
		"d/shaolin/obj/fojing2"+random(2) : 1,
	]));
	setup();
}

int valid_leave(object me, string dir)
{
        if (! present("shou yu", this_player()) &&
	    (objectp(present("daoyi chanshi", environment(me)))))
	{
		if (dir == "up" )
		{
			return notify_fail("道一说道: 你未经许可，不能上二楼。\n");
		}
	}
	return ::valid_leave(me, dir);
}

