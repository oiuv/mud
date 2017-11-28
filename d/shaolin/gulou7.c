// Room: /d/shaolin/gulou7.c
// Date: YZC 96/01/19

inherit ROOM;

string look_drum();
string look_out();

void create()
{
	set("short", "鼓楼七层");
	set("long", @LONG
这里就是鼓楼之顶。直入眼帘的便是一只大鼓。大鼓鼓身通红，
似由白杨木箍成。两头包以水牛皮，用一匝大铜钉钉在鼓身边缘。
鼓心有一圈白渍，看来是因为多次击打形成的。整个大鼓放在一
个一人高的架子上，架子底层搁着两根大鼓槌。尽管山风吹人欲
倒，谁都禁不住想击一下鼓(drum)试试。往外看，有个很大的汉
白玉窗台(out)，上面足可站一个人。
LONG );
	set("exits", ([
		"down" : __DIR__"gulou6",
	]));
	set("item_desc",([
		"drum"		:	(: look_drum :),
		"out"		:	(: look_out :),
	]));
	set("objects",([
		CLASS_D("shaolin") + "/qing-wen" : 1,
	]));
	setup();
}

void init()
{
	add_action("do_hit", "hit");
	add_action("do_out", "out");
}

int do_hit(string arg)
{
	object me;

	me = this_player();
	if (! arg || ( arg != "drum" ))
                return notify_fail("你要敲什麽？\n");

	me->receive_damage("qi", 30);

	if (random(me->query("dex")) < 5)
	{
		message_vision("$N一不小心敲到自己头上了。\n", me);
		me->unconcious();
	} else
	{
		mapping mine;

		mine = me->query_entire_dbase();
		message_vision("$N敲了一下大鼓，『咚……』声音传遍整个寺庙。\n", me);
		write("鼓声如迅雷般在你耳边炸响，你头脑中一片糊涂，\n"
			"全身摇摇欲坠，勉力支撑着不倒在地上。心中一个\n"
			"声音告诉你，得赶快离开这里，不然就没命了。\n");
                if (random(2) == 0)
                {
                        if (mine["potential"] - mine["learned_points"] < 100)
                        mine["potential"] += 1;
                } else
                {
                        if (mine["potential"] - mine["learned_points"] > 0)
                        mine["potential"] -= 1;
                }
	}
	return 1;
}

int do_out(string arg)
{
        object me;

        int i, ging_cost, qi_cost;

        me = this_player();
        me->start_busy(5);
        i = (int)me->query_skill("dodge") + random(5);

        ging_cost = 600 / (int)me->query("int");
        qi_cost = 500 / (int)me->query("int");

        if (((int)me->query("jing") < ging_cost) ||
            ((int)me->query("qi") < qi_cost))
                i = 0;

        message_vision("$N爬上窗台，一个纵身，跳了下去。\n", me);
        me->move(__DIR__"gulou");
	message_vision("只听『砰』地一声$N从塔顶跳了下来。\n", me);
	if (i < 50)
        {
                me->set_temp("die_reason", "从塔顶失足掉了下来摔死了");
		me->die();
	} else
        if (i < 125)
		me->unconcious();
	else
        {
		message_vision("$N已稳稳地站在地上。\n", me);
		if (i > 175 && me->query("dodge", 1) < 200)
			me->improve_skill("dodge", 1 + random(me->query("dex")));
		me->receive_damage("jing", ging_cost);
		me->receive_damage("qi", qi_cost);
	}

        return 1;
}

string look_drum()
{
	return
	"※※※※※※※※※※※※※※※※※※※※※※\n"
	"※※※※　　　　　　　　　　　　　　※※※※\n"
	"※※※※　　　　　佛语有曰：　　　　※※※※\n"
	"※※※※　　　　　　　　　　　　　　※※※※\n"
	"※※※※　『求一次菩萨，击一次鼓』　※※※※\n"
	"※※※※　　　　　　　　　　　　　　※※※※\n"
	"※※※※　　（ｈｉｔ　ｄｒｕｍ）　　※※※※\n"
	"※※※※　　　　　　　　　　　　　　※※※※\n"
	"※※※※※※※※※※※※※※※※※※※※※※\n";
}

string look_out()
{
	return  "这里是鼓楼顶层的窗台，从这里可以遥望整个少室山脉，\n"
"以及高耸入云的嵩山。浮世烟尘，尽在眼底。据说在此地\n"
"可以与天界诸佛直接交流，对禅修大有益处。\n";
}

