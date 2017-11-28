//Room: xiaojiuguan.c

inherit ROOM;

void create ()
{
        set ("short", "小酒馆");
        set ("long", @LONG
这是一家小酒馆，屋子并不是很宽敞，酒水也是长安城里最最廉价
的，可是却仍然有许多人来光顾，也不知道他们是来喝酒的，还是来欣
赏那位坐在柜台后面的老板娘。
LONG);
        set("exits", 
        ([ //sizeof() == 1
		"north" : __DIR__"liande-nankou",
        ]));
        set("objects", 
        ([ //sizeof() == 1
		__DIR__"npc/ruhua" : 1,
        ]));

	set("no_clean_up", 0);
        setup();
	replace_program(ROOM);
}
