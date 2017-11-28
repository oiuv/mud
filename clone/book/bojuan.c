// bojuan.c

inherit BOOK;

void create()
{
	set_name("帛卷", ({ "bo juan", "bo", "juan" }));
	set_weight(50);
	set("no_sell", 1);
	if (clonep())
		set_default_object(__FILE__);
	else {
		set("unit", "卷");
		set("long",
			"这是一卷帛卷，里面写着 ：\n"
			"庄子“逍遥游”有云：穷发之北有冥海者，天池也。有鱼焉，其广数千里。。。。\n");
		set("value", 500);
		set("material", "silk");
		set("skill", ([
			"name":	"beiming-shengong",	// name of the skill
			"exp_required":	0,	// minimum combat experience required
			"jing_cost":	10,	// jing cost every time study this
			"difficulty":	20,	// the base int to learn this skill
			"max_skill":	19,	// the maximum level you can learn
			"min_skill":    10,
		]) );
	}
}

void init()
{
	if( this_player() == environment() )
	{
		add_action("do_study", "study");
		add_action("do_study", "du");
	}
}

int do_study(string arg)
{
	object me = this_player();

	if (! id(arg))
		return notify_fail("你要读什么？\n");

	if (me->is_busy())
		return notify_fail("你现在正忙着呢。\n");
 
	if (me->is_fighter())
		return notify_fail("战斗中无法阅读新知！\n");

	if (me->query("jing") < 20)
		return notify_fail("你现在精力不足，休息一下再读吧。\n");

	if ((int)me->query_skill("beiming-shengong", 1) >= 20 &&
	    (int)me->query_skill("beiming-shengong", 1) <= 50 )
	{
		me->receive_damage("jing", 20 + random(20));
		me->improve_skill("beiming-shengong", 1 + random(me->query("int")));
		message_vision("$N正在专心研读北冥神功心法。\n", me);
		return 1;
	}
	return 0;
}
