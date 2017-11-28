// Room: /d/taishan/.c
// Date: CSWORD 96/03/25

inherit ROOM;

int do_study(string arg);

void create()
{
	set("short", "石经峪");
	set("long", @LONG
这里是一块大石坪，石面刻有篆文「金刚经」，字体其大如斗，
但却没有记载刻石者的名字和刻石的年代。过了此处，渐入空山，
山路越来越不好走了。
LONG );
	set("exits", ([
		"northup" : __DIR__"huima",
		"westdown" : __DIR__"doumo",
	]));
	set("objects",([
		__DIR__"npc/seng-ren" : 1,
	]));
	set("outdoors", "taishan");
	setup();
}

void init()
{
	add_action("do_study", "study");
	add_action("do_study", "du");
}


int do_study(string arg)
{
	object me;

	me = this_player();

	if (! arg || (arg != "stone"))
		return notify_fail("你要研究什么？\n");

	if ((int)me->query_skill("literate", 1) < 1)
		return notify_fail("你是个文盲，先学点文化(literate)吧。\n");

	me->receive_damage("jing", 30);

	message_vision("$N正专心研读石坪上的「金刚经」。\n", me);

	if ((int)me->query_skill("buddhism", 1) < 100)
	{
		me->improve_skill("buddhism", 1 + random(me->query("int")));
		write("你对着石坪上的「金刚经」琢磨了一回"
                      "儿，似乎对禅宗心法略有心得。\n");
		return 1;
	}

	write("你对着石坪瞧了一回儿，发现上面所说的佛理太过"
              "浅显，对你来说已毫无意义了。\n");

	return 1;
}


