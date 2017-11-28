#include <ansi.h>;
inherit ROOM;

void create()
{
	set("short", "悬天石");
        set("long",
                "从石上远眺，只见云海苍茫处，险绝万峦生，昆仑一脉，逶迤"
                "千里，真一派大好江山。悬天石立于昆仑山峰，足下悬崖峭壁，深"
                "渊万丈。");
	set("exits", ([
		"down" : __DIR__"shanlu3",
	]));

	set("outdoors", "mingjiao");
	setup();
        (CLASS_D("ultra") + "/huoshan")->come_here();
}

string long()
{
        object ob;
        string msg;

        msg = query("long");
        if (! objectp(ob = present("huo shan", this_object())))
                return sort_string(msg, 64, 4);

        if (! ob->is_fighting())
                msg += "一老者正站在石上遥观云海，衣衫鼓动，对你的"
                       "来到视若无物。";
        else
                msg += "只见一人正在与" +
                       (ob->is_fighting(this_player()) ? "你" : "人") +
                       "激战，层层气浪震得大石颤动不已。";

        return sort_string(msg, 58, 4);
}

void init()
{
	add_action("do_tiao", "tiao");
	add_action("do_tiao", "jump");
}

int do_tiao(object me)
{
	me = this_player();
	message_vision(HIY "\n$N" HIY "迟疑了片刻猛地向深渊"
                       "跳下，人影越飘越小。\n\n" NOR, me);

	if (me->query_dex() > 25)
	{
		me->move(__DIR__"gudi1");
	} else
        if (me->query_dex() > 20)
	{
		me->move(__DIR__"gudi1");
		me->unconcious();
	} else
	{
		me->move(__DIR__"gudi1");
		me->die();
	}
	return 1;
}

