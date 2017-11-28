inherit ROOM;

void create()
{
	set("short", "庙会");
	set("long", @LONG
这里是洛阳城的庙会，只要你身上有两钱儿，在这里就会受到热情的
招呼。任何你不知道的事，你在这里打听一下，都可以知道个八九不离十。
整个庙会里有货郎，卖肉的，卖玩具的，卖艺的，卖药的，杂耍的，风味
小吃，应有尽有。
LONG);
        set("outdoors", "luoyang");
        set("no_clean_up", 0);
        set("exits", ([
  		"north" : __DIR__"wanju",
  		"south" : __DIR__"eroad4",
	]));
        set("objects", ([
                "/d/beijing/npc/xianren" : 2,
        ]));
	setup();
	replace_program(ROOM);
}
