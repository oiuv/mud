inherit ROOM;

void create()
{
	set("short", "唐三彩");
	set("long", @LONG
瓷器之中以唐三彩最为名贵，而洛阳的唐三彩又是出的最多，而且最
有名的。这家店铺的主人独辟蹊径，在此开了一家唐三彩专卖店，生意相
当兴隆。据说，唐三彩上色时所有的颜色均只以红，黄，懒三原色为基础
手工调制而成，故极其的珍贵。
LONG);
	set("no_clean_up", 0);
	set("exits", ([
  		"east" : __DIR__"nroad1",
	]));
        set("objects", ([
                __DIR__"npc/qin" : 1,
        ]));
	setup();
	replace_program(ROOM);
}
