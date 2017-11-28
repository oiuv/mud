inherit ROOM;

void create()
{
        set("short", "清心阁");
        set("long",@LONG
这是寺中诸僧前去后院参修之前清心净欲的地方。阁中只有地面放有
几个蒲团，除此之外别无它物，确然是个清静之处。
LONG
        );
        set("exits", ([
		"south": __DIR__"doushuai",
                "north" : __DIR__"wuwujing",
	]));
	set("objects",([
                __DIR__"npc/xiaoshami" : 2,
        ]));
	set("sleep_room", 1);
        set("no_fight",1);
        set("no_steal",1);
        set("no_clean_up", 0);
        setup();
        replace_program(ROOM);
}
