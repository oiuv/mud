#include <ansi.h>
#include "zhenyuan.h"

inherit NPC;
inherit F_MASTER;
inherit F_QUESTER;
inherit F_GUARDER;

mixed ask_skill1();
mixed ask_skill2();
mixed ask_skill3();

void create()
{
	set_name("王剑杰", ({ "wang jianjie", "wang", "jianjie" }));
        set("long", @LONG
他是镇远镖局总镖头王维扬的第二个儿子，子承
父业，练得一身八卦门的好武功。现在镖局里的
各种事务由他总管，看上去他精明老练，稳重务
实，不怒自威。
LONG );
	set("title", "八卦门第二代高手");
  	set("gender", "男性");
  	set("age", 45);
	set("class", "fighter");
        set("attitude", "peaceful");
        set("str", 35);
        set("int", 35);
        set("con", 35);
        set("dex", 35);

        set("max_qi", 3500);
        set("max_jing", 3500);
        set("neili", 3200);
        set("max_neili", 3200);
        set("jiali", 130);
        set("combat_exp", 1500000);

        set_skill("parry", 160);
        set_skill("wai-bagua", 160);
        set_skill("force", 160);
        set_skill("nei-bagua", 160);
        set_skill("bagua-xinfa", 140);
        set_skill("dodge", 140);
        set_skill("bagua-bu", 140);
        set_skill("blade", 160);
        set_skill("bagua-dao", 160);
        set_skill("kuimang-dao", 160);
        set_skill("strike", 160);
        set_skill("bagua-zhang", 140);
        set_skill("bazhen-zhang", 160);
        set_skill("cuff", 140);
        set_skill("bagua-quan", 140);
        set_skill("throwing", 140);
        set_skill("bagua-biao", 140);
        set_skill("literate", 160);
  	set_skill("martial-cognize", 140);

        set("no_teach", ([
                "wai-bagua" : "这个…外八卦神功…你还是找我爹或是我哥教你好了。",
                "nei-bagua" : "我爹说过了，内八卦神功不能随便传授，你直接找我爹好了。",
                "bagua-dao" : "八卦刀法向来便是由我父亲亲自教授。",
        ]));

	map_skill("blade", "bagua-dao");
	map_skill("unarmed", "bazhen-zhang");
	map_skill("dodge", "bagua-bu");
	map_skill("force", "nei-bagua");
	map_skill("strike", "bagua-zhang");
	map_skill("cuff", "bagua-quan");
	map_skill("parry", "wai-bagua");
	map_skill("throwing", "bagua-biao");

	prepare_skill("strike", "bazhen-zhang");

        set("inquiry", ([
                "劈卦拳"   : (: ask_skill1 :),
                "背心钉"   : (: ask_skill2 :),
                "蝰蟒盘身" : (: ask_skill3 :),
        ]));

        set("coagents", ({
                ([ "startroom" : "/d/beijing/shufang",
                   "id"        : "wang weiyang" ]),
        }));

        set("guarder", ([
                "refuse_other": CYN "$N" CYN "对$n" CYN "冷喝道："
                                "我不管你是怎么进来的，但是请你马"
                                "上离开，否则休怪我无情！" NOR,
                "refuse_carry": CYN "$N" CYN "对着$n" CYN "剑眉一"
                                "竖，喝道：你背上背的是什么？给我"
                                "放下来！" NOR,
        ]));

        set("chat_chance_combat", 100);
        set("chat_msg_combat", ({
                (: perform_action, "blade.mang" :),
                (: perform_action, "strike.yin" :),
                (: perform_action, "parry.zhen" :),
                (: perform_action, "throwing.zhi" :),
                (: perform_action, "throwing.xian" :),
                (: exert_function, "recover" :),
                (: exert_function, "powerup" :),
        }) );

  	create_family("八卦门", 2, "高手");

  	setup();

  	carry_object("/clone/misc/cloth")->wear();
        set_temp("handing", carry_object("/d/beijing/npc/obj/jinbiao"));
}

void attempt_apprentice(object me)
{
        if (! permit_recruit(me))
                return;

	if (me->query("combat_exp") < 20000)
    	{
      		command("say 你的江湖经验太差了，还是在镖局里再摸爬滚打一段时间吧！");
      		return;
    	}

  	command("nod");
  	command("say 既然如此，我就收下你。你平时也要多为镖局出力。");
        command("recruit " + me->query("id"));
        if ((string)me->query("class") != "fighter")
                me->set("class", "fighter");
}

mixed ask_skill1()
{
        object me;

        me = this_player();

        if (me->query("can_perform/bagua-quan/gua"))
                return "这招我已经教过你了，自己下去练吧。";

        if (me->query("family/family_name") != query("family/family_name"))
                return RANK_D->query_respect(me) + "和本镖局素无来往，何出此言？";

        if (me->query_skill("bagua-quan", 1) < 1)
                return "你连八卦拳法都没学，还谈什么绝招可言？";

        if (me->query("gongxian") < 100)
                return "你为镖局出力不够，这招我暂时不忙传你。";

        if (me->query_skill("force") < 100)
                return "你的内功火候尚需提高，练好了再来找我吧。";

        if (me->query_skill("bagua-quan", 1) < 70)
                return "你的八卦拳法还练得不到家，自己下去练练再来吧！";

        message_vision(HIY "$n" HIY "对$N" HIY "点了点头，说道：“我给你演示一遍"
                       "，可要瞧清\n楚了。”$n" HIY "话音刚落，突然身体一侧，双掌"
                       "顿时向下沉\n去，接着却又向上一翻，朝着$N" HIY "的双肩斜斜"
                       "地劈去，招数甚\n为精妙，顿时将$N" HIY "攻了个措手不及。\n"
                       NOR, me, this_object());

        command("haha");
        command("say 你看明白了多少？");
        tell_object(me, HIC "你学会了「劈卦拳」。\n" NOR);

        if (me->can_improve_skill("cuff"))
                me->improve_skill("cuff", 1500000);
        if (me->can_improve_skill("bagua-quan"))
                me->improve_skill("bagua-quan", 1500000);
        me->improve_skill("martial-cognize", 1500000);
        me->set("can_perform/bagua-quan/gua", 1);
        me->add("gongxian", -100);

        return 1;
}

mixed ask_skill2()
{
        object me;

        me = this_player();

        if (me->query("can_perform/bagua-zhang/ding"))
                return "这招我已经教过你了，自己下去练吧。";

        if (me->query("family/family_name") != query("family/family_name"))
                return RANK_D->query_respect(me) + "和本镖局素无来往，何出此言？";

        if (me->query_skill("bagua-zhang", 1) < 1)
                return "你连八卦掌法都没学，还谈什么绝招可言？";

        if (me->query("gongxian") < 150)
                return "你为镖局出力不够，这招我暂时不忙传你。";

        if (me->query_skill("force") < 120)
                return "你的内功火候尚需提高，练好了再来找我吧。";

        if (me->query_skill("bagua-zhang", 1) < 80)
                return "你的八卦掌法还练得不到家，自己下去练练再来吧！";

        message_vision(HIY "$n" HIY "眉头微微一皱，上下打量了$N" HIY "一翻，这才伸"
                       "手将$N" HIY "招\n至身旁，在耳边轻声讲解了半天，时不时还探出"
                       "右手比划几\n下招式，$N" HIY "听后冷笑一声，似乎有所领悟。\n"
                       NOR, me, this_object());

        command("nod");
        command("say 这招可以攻敌不备，你自己下去练吧。");
        tell_object(me, HIC "你学会了「背心钉」。\n" NOR);
        if (me->can_improve_skill("strike"))
                me->improve_skill("strike", 1500000);
        if (me->can_improve_skill("bagua-zhang"))
                me->improve_skill("bagua-zhang", 1500000);
        me->improve_skill("martial-cognize", 1500000);
        me->set("can_perform/bagua-zhang/ding", 1);
        me->add("gongxian", -150);

        return 1;
}

mixed ask_skill3()
{
        object me;

        me = this_player();

        if (me->query("can_perform/kuimang-dao/pan"))
                return "这招我已经教过你了，自己下去练吧。";

        if (me->query("family/family_name") != query("family/family_name"))
                return RANK_D->query_respect(me) + "和本镖局素无来往，何出此言？";

        if (me->query_skill("kuimang-dao", 1) < 1)
                return "你连蝰蟒刀法都没学，还谈什么绝招可言？";

        if (me->query("gongxian") < 50)
                return "你为镖局出力不够，这招我暂时不忙传你。";

        if (me->query_skill("force") < 60)
                return "你的内功火候尚需提高，练好了再来找我吧。";

        if (me->query_skill("kuimang-dao", 1) < 40)
                return "你的蝰蟒刀法还练得不到家，自己下去练练再来吧！";

        message_vision(HIY "$n" HIY "笑了笑，伸手将$N" HIY "招到身前，低声在$N" HIY
                       "耳旁嘀咕了半\n天。然后又拔出腰刀翻转数下，斜撩而出。似乎是"
                       "一种颇为\n独特的刀诀。\n" NOR, me, this_object()); 

        command("nod");
        command("say 这招很简单，稍加练习便行。");
        tell_object(me, HIC "你学会了「蝰蟒盘身」。\n" NOR);
        if (me->can_improve_skill("blade"))
                me->improve_skill("blade", 1500000);
        if (me->can_improve_skill("kuimang-dao"))
                me->improve_skill("kuimang-dao", 1500000);
        me->improve_skill("martial-cognize", 1500000);
        me->set("can_perform/kuimang-dao/pan", 1);
        me->add("gongxian", -50);

        return 1;
}

void unconcious()
{
        die();
}
