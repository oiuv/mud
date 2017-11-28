inherit ROOM;

void create()
{
	set("short", "一线牵");
	set("long", @LONG
你现在正地方叫一线牵，这里是专门替人缔结婚约和解除婚约的地方，
洛阳城里所有的夫妇都是在这里喜结良缘的，就连附近镇子也有许多慕名
而来的年青人。
LONG);
	set("no_clean_up", 0);
	set("exits", ([
  		"north" : __DIR__"eroad2",
	]));
        set("objects", ([
                "/adm/npc/hongniang" : 1,
        ]));
	setup();
	replace_program(ROOM);
}
