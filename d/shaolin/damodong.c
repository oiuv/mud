// Room: /d/shaolin/damodong.c
// Date: YZC 96/01/19

inherit ROOM;

void create()
{
	set("short", "达摩洞");
	set("long", @LONG
这里是达摩古洞。五百年前南天竺僧人菩提达摩来到少林寺，见
此风水宝地，就住下来广罗弟子，传授禅宗，开创少林寺佛教禅宗千
年不败之基。达摩祖师常在此面壁悟道，一坐十年，壁间隐隐似仍可
看到他面壁时的打坐姿态。除地上的几块竹片外，洞中空无一物。
LONG );
	set("exits", ([
		"out" : __DIR__"bamboo1",
	]));
	set("objects",([
		"/clone/book/book-bamboo" : 1,
		CLASS_D("shaolin")+"/da-mo" : 1,
	]));
	setup();
}

void init()
{
	object me = this_player();

	if ((int)me->query_temp("bamboo/count") == 14 &&
	    (int)me->query_skill("dodge", 1) >= 30 &&
	    (int)me->query_skill("dodge", 1) <= 100 &&
	    present("bamboo", me) )
	{
		me->receive_damage("jing", 20);
		me->improve_skill("dodge", me->query("dex"));
	}

        add_action("do_mianbi", "面壁");	
        add_action("do_mianbi", "mianbi");	
}

int do_mianbi()
{
	object me = this_player();

	message_vision("$N面对着达摩洞後半边的石壁跌坐静思，良久，似有所悟。\n", me);
	
	me->set_busy(10);
	me->set("shen", 0);

	return 1;
}
