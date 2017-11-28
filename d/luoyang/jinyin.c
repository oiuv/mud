inherit ROOM;

void create()
{
	set("short", "金银铺");
	set("long", @LONG
这里原本是洛阳城里最大金银铺，洛阳城的居民遇到需要兑换存取的
时候都是直奔这里。这里的生意原本是最最兴隆的，可是却在一个月以前，
因为这里的老板不怎么的得罪了官府，被查封了起来。
LONG);
	set("no_clean_up", 0);
	set("exits", ([
  		"north" : __DIR__"eroad4",
	]));
        set("objects", ([
                "/d/kaifeng/npc/guanbing" : 2,
        ]));
	setup();
	replace_program(ROOM);
}
