#include <ansi.h> 
inherit ROOM;

int do_lianzhi(string arg);

void create()
{
        set("short", "练毒室");
        set("long", @LONG
这里是五毒教弟子专门的练毒室，可以在这里练制各种毒
药，案上摆着各式各样的器具。屋内正中放着一个一人多高的
丹炉，炉火正旺，有个黑瘦的道人正手持桃木剑绕炉疾走，嘴
里呐呐自语不知在念些什么。
LONG);
        set("no_fight", 1);
        set("exits", ([
                "north" : __DIR__"nanyuan",
        ]));
        set("objects", ([
                __DIR__"npc/daoren": 1,
        ]));
        setup();
}

void init()
{
        add_action("do_lianzhi", "lianzhi");
}

int do_lianzhi (string arg)
{
        object /*ob,*/ me = this_player();
        int time = 15 + random(15);

        if (me->query("family/family_name") != "五毒教")
                return notify_fail("你不知道该如何下手。\n");

        if (me->query_temp("liandu/wudu"))
                return notify_fail("你现在正炼着呢，切勿分心。\n");

        if (me->is_busy())
                return notify_fail("你现在正忙着呢。\n");

        if (me->query_skill("wudu-qishu", 1) < 60 )
                return notify_fail("你的五毒奇术不够娴熟，无法炼毒。\n");

        if (me->query("jing") < 80 || me->query("qi") < 80)
                return notify_fail("你现在的精神状况不佳，无法炼毒。\n");

        if (arg != "heding hong" && arg != "furou gao" &&
            arg != "kongque dan" && arg != "chixie fen" &&
            arg != "wusheng san" && arg != "duanchang san")
	        return notify_fail("你要炼制什么毒药？\n");

        if (arg == "heding hong")
        {
                if (! present("du nang", me)
                   || ! present("shexin zi", me)
                   || ! present("qianri zui", me))
                        return notify_fail("你身上的原料不齐，无法炼毒。\n");

                destruct(present("du nang", me));
                destruct(present("shexin zi", me));
                destruct(present("qianri zui", me));
                me->set_temp("liandu/wudu", "hedinghong");
        } else

        if (arg == "furou gao")
        {
                if (! present("du nang", me)
                   || ! present("fugu cao", me)
                   || ! present("chuanxin lian", me))
                        return notify_fail("你身上的原料不齐，无法炼毒。\n");

                destruct(present("du nang", me));
                destruct(present("fugu cao", me));
                destruct(present("chuanxin lian", me));
                me->set_temp("liandu/wudu", "furougao");
        } else

        if (arg == "kongque dan")
        {
                if (! present("du nang", me)
                   || ! present("fugu cao", me)
                   || ! present("qianri zui", me))
                        return notify_fail("你身上的原料不齐，无法炼毒。\n");

                destruct(present("du nang", me));
                destruct(present("fugu cao", me));
                destruct(present("qianri zui", me));
                me->set_temp("liandu/wudu", "kongquedan");
        } else

        if (arg == "chixie fen")
        {
                if (! present("du nang", me)
                   || ! present("shexin zi", me)
                   || ! present("duanchang cao", me))
                        return notify_fail("你身上的原料不齐，无法炼毒。\n");

                destruct(present("du nang", me));
                destruct(present("shexin zi", me));
                destruct(present("duanchang cao", me));
                me->set_temp("liandu/wudu", "chixiefen");
        } else

        if (arg == "duanchang san")
        {
                if (! present("du nang", me)
                   || ! present("duanchang cao", me)
                   || ! present("chuanxin lian", me))
                        return notify_fail("你身上的原料不齐，无法炼毒。\n");

                destruct(present("du nang", me));
                destruct(present("duanchang cao", me));
                destruct(present("chuanxin lian", me));
                me->set_temp("liandu/wudu", "duanchangsan");
        } else

        if (arg == "wusheng san")
        {
                if (! present("du nang", me)
                   || ! present("heding hong", me)
                   || ! present("duanchang san", me)
                   || ! present("furou gao", me)
                   || ! present("chixie fen", me)
                   || ! present("kongque dan", me)
                   || ! present("jinshe duye", me))
                        return notify_fail("你身上的原料不齐，无法炼毒。\n");

                destruct(present("du nang", me));
                destruct(present("heding hong", me));
                destruct(present("duanchang san", me));
                destruct(present("furou gao", me));
                destruct(present("chixie fen", me));
                destruct(present("kongque dan", me));
                destruct(present("jinshe duye", me));
                me->set_temp("liandu/wudu", "wushengsan");
        }

        message_vision (HIR "\n$N" HIR "将身上的药品投入丹炉，按照秘法小心"
                        "炼制起来。\n\n" NOR, me);
        me->start_call_out((: call_other, __FILE__, "liandu", me :), time);
        me->start_busy(time / 2 + 1);
        return 1;
}

void liandu(object me)
{
        object ob;
        int skill, lvl;
        int exp, pot, sco;

        exp = 300 + random(300);
        pot = 100 + random(200);
        sco = 100 + random(100);

        skill = (int)me->query_skill("wudu-qishu", 1);

        lvl = (int)me->query_skill("poison", 1) / 2 +
              (int)me->query_skill("wudu-qishu", 1) + 10;

        if (environment(me) != this_object())
                return;

        me->receive_damage("jing", 50 + random(30));
        me->receive_damage("qi", 50 + random(30));

        if (random(skill) < 50 && random(3) == 1) 
        {
                me->delete_temp("liandu/wudu");
                message_vision(HIR "\n突然间一股腥恶的焦臭至$N" HIR "身旁传"
                               "来，看来是炼毒失败了。\n"NOR,me);
        } else
        {
                message_vision(HIW "\n炉顶白雾渐渐转淡，传出阵刺鼻的腥味，$N"
                               HIW "连忙小心翼翼地将药粉取出。\n" NOR, me);

                if (me->query_temp("liandu/wudu") == "hedinghong")
		{
	                ob = new("/clone/poison/hedinghong");
		        ob->set("poison", ([
        		        "level" : lvl,
                		"id"    : me->query("id"),
                		"name"  : "鹤顶红剧毒",
                		"duration" : 15,
	        	]));
                        tell_object(me, HIY "你炼成了「" + NOR + ob->name()
                                        + NOR + HIY "」。\n" NOR);
		} else

                if (me->query_temp("liandu/wudu") == "furougao")
		{
	                ob = new("/clone/poison/furougao");
		        ob->set("poison", ([
        		        "level" : lvl,
                		"id"    : me->query("id"),
                		"name"  : "腐肉膏剧毒",
                		"duration" : 15,
	        	]));
                        tell_object(me, HIY "你炼成了「" + NOR + ob->name()
                                        + NOR + HIY "」。\n" NOR);
		} else

                if (me->query_temp("liandu/wudu") == "kongquedan")
		{
	                ob = new("/clone/poison/kongquedan");
		        ob->set("poison", ([
        		        "level" : lvl,
                		"id"    : me->query("id"),
                		"name"  : "孔雀胆剧毒",
                		"duration" : 15,
	        	]));
                        tell_object(me, HIY "你炼成了「" + NOR + ob->name()
                                        + NOR + HIY "」。\n" NOR);
		} else

                if (me->query_temp("liandu/wudu") == "chixiefen")
		{
	                ob = new("/clone/poison/chixiefen");
		        ob->set("poison", ([
        		        "level" : lvl,
                		"id"    : me->query("id"),
                		"name"  : "赤蝎粉剧毒",
                		"duration" : 15,
	        	]));
                        tell_object(me, HIY "你炼成了「" + NOR + ob->name()
                                        + NOR + HIY "」。\n" NOR);
		} else

                if (me->query_temp("liandu/wudu") == "duanchangsan")
		{
	                ob = new("/clone/poison/duanchangsan");
		        ob->set("poison", ([
        		        "level" : lvl,
                		"id"    : me->query("id"),
                		"name"  : "断肠散剧毒",
                		"duration" : 15,
	        	]));
                        tell_object(me, HIY "你炼成了「" + NOR + ob->name()
                                        + NOR + HIY "」。\n" NOR);
		} else
                if (me->query_temp("liandu/wudu") == "wushengsan")
		{
	                ob = new("/clone/poison/wushengsan");
		        ob->set("poison", ([
        		        "level" : lvl + 20,
                		"id"    : me->query("id"),
                		"name"  : "五圣散剧毒",
                		"duration" : 25,
	        	]));
                        tell_object(me, HIY "你炼成了五毒教独门秘药「" + NOR
                                        + ob->name() + NOR + HIY "」。\n" NOR);

        		if (me->query("potential") >
                           me->query_potential_limit()) 
                		pot = 1;

	                me->add("combat_exp", exp);
	                me->add("score", sco);
		        me->improve_potential(pot);

                        tell_object(me, HIC "你获得了" + chinese_number(exp)
                                        + "点经验、" + chinese_number(pot) +
                                        "点潜能以及" + chinese_number(sco) +
                                        "点江湖阅历。\n" NOR); 
		}

                ob->move(me);
                me->delete_temp("liandu/wudu");

                me->improve_skill("poison", 50 + me->query("int"));
                if (me->can_improve_skill("wudu-qishu"))
                	me->improve_skill("wudu-qishu", 50 + me->query("int"));

                tell_object(me, HIC "炼毒过程中你的「基本毒技」和「五毒奇术」"
                                "提高了！\n\n" NOR);
        }
}