// jushi.c

inherit ROOM;
#include <ansi.h>;
void create()
{
        set("short", "居室");
	set("long", @LONG
这里是岳夫人的寝室，岳夫人在江湖上人称「淑女剑」，为人极有骨
气，她的居室却相当朴素，床椅之外，靠窗(window)处有个梳妆台(tai)，
墙上挂着一口宝剑(sword)， 蛇皮吞口看来很是锋利。
LONG );
        set("exits", ([ /* sizeof() == 1 */
            "east" : __DIR__"changlang",
        ]));

        set("objects", ([
            CLASS_D("huashan") + "/yue-wife" :1,
        ]));

        set("item_desc", ([
		"window" : "窗外就是天声峡了。往外望去，云深谷幽令人目眩。\n",
		"sword"  : "这是上次前往福建时带回的龙泉剑。\n",
		"tai"    : "这是一张红漆梳妆台，半开的抽屉斜插着几朵鲜花。\n"
        ]));

        setup();
}
void init()
{
        add_action("do_move", "push");
        add_action("do_move", "move");
        add_action("do_pick", "pick");
        add_action("do_pick", "zhai");
}

int do_move(string arg)
{
        object yue;
	object paper, me = this_player();

        if (arg != "tai")
		return 0;

        yue = present("yue wife", environment(me));
        if (! objectp(yue) || ! living(yue))
                return 0;

	if (me->query("family/master_id") != yue->query("id"))
	{
		write("岳夫人喝道：这位" +
		      RANK_D->query_respect(me) +
		      "，你不能随便翻人家东西。\n");
		return 1;
	}

        if (me->query("combat_exp") < 20000)
        {
                write("岳夫人看了看你，皱眉道：“你好好给我"
                      "练功去，瞎翻什么？”\n");
                return 1;
        }

	if (! query("had_yunu"))
	{
		message_vision("$N轻轻的拉开抽屉，发现里面有一"
			       "本书...。\n", me);
		paper = new("/clone/book/shunv_book");
		paper->move(__FILE__);
		set("had_yunu", 1);
		return 1;
	}

	message_vision("$N轻轻的拉开抽屉，可是里面啥都"
		       "没有...\n", me);
	return 1;
}

int do_pick(string arg)
{
        object sword;
        object yue;
	object me = this_player();

        if (arg != "sword")
		return 0;

        yue = present("yue wife", environment(me));
        if (! objectp(yue) || ! living(yue))
                return 0;

	if (me->query("family/master_id") != yue->query("id"))
	{
		write("岳夫人喝道：这位" + RANK_D->query_respect(me) +
		      "，你不能随便翻人家东西。\n");
		return 1;
	}

        if (me->query("combat_exp") < 20000)
        {
                write("岳夫人看了看你，皱眉道：“你好好给我"
                      "练功去，乱动什么？”\n");
                return 1;
        }

	if (! query("had_sword"))
	{
		message_vision("$N轻轻的摘下宝剑，哈哈，真"
			       "开心...\n", me);
		sword = new(__DIR__"obj/longquan");
		sword->move(me, 1);
		set("had_sword", 1);
		return 1;
	}

	message_vision("$N伸手去摘宝剑，才发现只剩剑鞘了，宝剑早就"
		       "被别人取走了...。\n", me);
	return 1;
}

void reset()
{
	::reset();
	delete("had_sword");
	delete("has_yunu");
}
