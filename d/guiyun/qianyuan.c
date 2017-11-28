#include <ansi.h>;
inherit ROOM;

void create()
{
	set("short", "前院");
	set("long", @LONG
这里是归云庄的前院，相当宽敞。左右靠墙各建有几间低
矮的平房，像是家人的住处。正前方几棵树木，湖中清风吹来
落叶萧萧而下。右首有一对白雕(diao)，毛羽如雪。原来这里
是桃花岛为方便弟子回岛的。
LONG );
        set("outdoors", "guiyun");
	set("no_clean_up", 0);
	set("valid_startroom", 1);
	set("item_desc", ([
		"diao" : HIW "\n这一对白雕正展翅欲飞。如果是桃花岛"
                         "的弟子，骑上(" HIY "ride" HIW ")就\n可以"
                         "飞到桃花岛，非常便利。\n\n" NOR,
	]));
	set("exits", ([
		"out"   : __DIR__"damen",
		"north" : __DIR__"dating",
	]));
	setup();
	"/clone/board/guiyun_b"->foo();
}

void init()
{
    	add_action("do_ride", "ride");
}

int do_ride(string arg)
{
    	object ob = this_player();

        if (! arg || arg != "diao" )
                return notify_fail("你要骑什么？\n");

        if ((int)query("sb_ride"))
                return notify_fail("现在白雕已经被人骑走了，等会儿再来吧。\n" ) ;

        if (ob->query("family/family_name") != "桃花岛")
        {
      		message_vision(HIW "\n$N" HIW "一跃身跨上了白雕。只见白雕"
                               "仰天长唳，突然猛然一颠……\n" HIR "结果$N"
                               HIR "摔了个鼻青脸肿，看来白雕对$N" HIR "并"
                               "不太感兴趣。\n" NOR, ob);
      		return 1;
    	}

    	add("sb_ride", 1);
    	message_vision(HIW "\n$N" HIW "一跃身跨上了白雕。只见白雕仰天长唳"
                       "，突然展翅高飞。但\n看一雕一人身形渐渐缩小，终至不"
                       "见。\n\n" NOR, ob);

    	ob->move("/d/taohua/lantian") ;
    	tell_object(ob, HIW "\n你不断地飞呀飞，万水千山身下飘过……\n\n" NOR);
    	call_out("taohua", 1, ob);
    	return 1;
}

void taohua(object ob)
{
  	ob->move("/d/taohua/damen");
  	tell_object(ob, HIC "\n你终于飞到了桃花岛，白雕落了下来。\n\n" NOR);
    	add("sb_ride", -1);
}
