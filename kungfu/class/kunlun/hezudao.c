#include <ansi.h>
#include "kunlun.h"

#define LIANGJI    "/clone/lonely/liangjijian"

inherit NPC;
inherit F_MASTER;

mixed ask_skill1();
mixed ask_skill2();
mixed ask_skill3();
mixed ask_skill4();
mixed ask_jian();

void create()
{
        object ob;
	set_name("何足道", ({"he zudao", "he", "zudao"}));
	set("title", "昆仑派开山祖师");
	set("nickname", HIY "昆仑三圣" NOR);
        set("long", @LONG
这就是昆仑派开山祖师，号称琴剑棋三绝的昆
仑三圣何足道。见他长脸深目，面目清秀。却
是瘦骨棱棱，身着一青衫。
LONG);
	set("gender", "男性");
	set("age", 95);
	set("attitude", "friendly");
	set("shen_type", 1);
        set("str", 40);
        set("int", 40);
        set("con", 40);
        set("dex", 40);
        set("max_qi", 6000);
        set("max_jing", 5000);
        set("neili", 6000);
        set("max_neili", 6000);
        set("jiali", 200);
        set("combat_exp", 4000000);

        set_skill("force", 300);
        set_skill("kunlun-xinfa", 300);
        set_skill("liangyi-shengong", 300);
        set_skill("dodge", 300);
        set_skill("chuanyun-bu", 300);
        set_skill("strike", 300);
        set_skill("kunlun-zhang", 300);
        set_skill("hand", 300);
        set_skill("sanyin-shou", 300);
        set_skill("cuff", 300);
        set_skill("zhentian-quan", 300);
        set_skill("parry", 300);
        set_skill("sword", 320);
        set_skill("kunlun-jian", 300);
        set_skill("xunlei-jian", 300);
        set_skill("zhengliangyi-jian", 300);
        set_skill("qiankun-jian", 320);
        set_skill("throwing", 300);
        set_skill("kunlun-qifa", 300);
        set_skill("tanqin-jifa", 320);
        set_skill("jian-jia", 320);
        set_skill("qiuyue-lai", 320);
        set_skill("tieqin-yin", 300);
        set_skill("chess", 320);
        set_skill("literate", 280);
        set_skill("martial-cognize", 300);

        map_skill("force", "liangyi-shengong");
        map_skill("dodge", "chuanyun-bu");
        map_skill("parry", "zhengliangyi-jian");
        map_skill("sword", "qiankun-jian");
        map_skill("cuff", "zhentian-quan");
        map_skill("strike", "kunlun-zhang");
        map_skill("hand", "sanyin-shou");
        map_skill("throwing", "kunlun-qifa");
        map_skill("tanqin-jifa", "jian-jia");

        prepare_skill("strike", "kunlun-zhang");
        prepare_skill("hand", "sanyin-shou");

        create_family("昆仑派", 1, "祖师");

        set("inquiry", ([
                "绝招"      : "你要问什么绝招？",
                "绝技"      : "你要问什么绝技？",
                "乾坤劲"    : (: ask_skill1 :),
                "日月乾坤"  : (: ask_skill2 :),
                "逆转乾坤"  : (: ask_skill3 :),
                "日入空山"  : (: ask_skill4 :),
                "两极剑"    : (: ask_jian :),
        ]));

        set("chat_chance_combat", 100);
        set("chat_msg_combat", ({
                (: perform_action, "sword.ni" :),
                (: perform_action, "sword.riyue" :),
                (: perform_action, "strike.kong" :),
                (: exert_function, "recover" :),
                (: exert_function, "powerup" :),

        }) );

	setup();

        set_temp("apply/damage", 100); 
        set_temp("apply/unarmed_damage", 100); 
        set_temp("apply/armor", 200); 

        if (clonep())
        {
                ob = find_object(LIANGJI);
                if (! ob) ob = load_object(LIANGJI);
                if (! environment(ob))
                {
                        ob->move(this_object());
                        ob->wield();
                } else
                {
                        ob = new("clone/weapon/changjian");
                        ob->move(this_object());
                        ob->wield();
                }
        }

        carry_object("clone/misc/cloth")->wear();
        set_temp("handing", carry_object("/d/kunlun/obj/jwqin"));
}

void attempt_apprentice(object me)
{
        if (! permit_recruit(me))
                return;

        if ((int)me->query("shen") < 10000)
        {
                command("say 武学之道深久长远，要成为当之无愧的大侠，德"
                        "行还在首位。");
                command("say 我那几个后辈不成气候，但却希望"
                        + RANK_D->query_respect(me) + "你能够多多注意。");
                return;
        }

        if ((int)me->query("combat_exp") < 400000)
        {
                command("sigh");
                command("say 你的江湖经验太浅，我就算收了你，恐怕你也难"
                        "有所作为。");
                return;
        }

	if (me->query_int() < 38)
        {
	        command("say 高深的武功以及精深的技艺都需灵性极高的人才"
                        "能悟其真谛，不致背道而驰。");
         	command("say 我看" + RANK_D->query_respect(me) + "还是"
                        "先回去多读点书吧。");
                return;
	}

        if ((int)me->query_skill("liangyi-shengong", 1) < 100)
        {
		command("say 修习我的武功及剑法都需强大的内力为辅。");
		command("say 我看" + RANK_D->query_respect(me) + "是否"
                        "还应该先在本门的内功上多下点功夫？");
		return;
	}

        if ((int)me->query_skill("zhengliangyi-jian", 1) < 100)
        {
		command("say 本派的正两仪剑法乃武林一绝，，我看"
                        + RANK_D->query_respect(me) + "对此还练"
                        "得不够。");
		return;
	}

	command("say 看来你也是性情中人，我就教你一些琴剑棋的知识吧。");
        command("recruit " + me->query("id"));
}

mixed ask_skill1()
{
        object me;

        me = this_player();

        if (me->query("can_perform/qiankun-jian/qian"))
                return "咦？这招你不是已经会了吗？";

        if (me->query("family/family_name") != query("family/family_name"))
                return RANK_D->query_respect(me) + "和本派素无瓜葛，何出此言？";

        if (me->query_skill("qiankun-jian", 1) < 1)
                return "你连乾坤神剑都没学，还谈什么绝招可言？";

        if (me->query("gongxian") < 300)
                return "你对本派所作出的贡献不够，这一招我暂时还不能传你。";

        if (me->query_skill("force") < 150)
                return "你的内功火候不足，学不了这一招！";

        if (me->query_skill("qiankun-jian", 1) < 100)
                return "你的乾坤神剑修为还不够，自己下去练练再来吧。";

        message_vision(HIY "$n" HIY "微微一笑，转身从弦琴上取出一本"
                       "剑经，指着其中一段对$N" HIY "细说\n良久，$N"
                       HIY "一边听一边点头。\n" NOR, me, this_object());
        command("nod");
        command("say 这是我早年所创的剑法，并不强劲，下去后稍加练习便成。");
        tell_object(me, HIC "你学会了「乾坤劲」。\n" NOR);

        if (me->can_improve_skill("sword"))
                me->improve_skill("sword", 1500000);
        if (me->can_improve_skill("qiankun-jian"))
                me->improve_skill("qiankun-jian", 1500000);
        me->improve_skill("martial-cognize", 1500000);
        me->set("can_perform/qiankun-jian/qian", 1);
        me->add("gongxian", -300);

        return 1;
}

mixed ask_skill2()
{
        object me;

        me = this_player();

        if (me->query("can_perform/qiankun-jian/riyue"))
                return "咦？这招你不是已经会了吗？";

        if (me->query("family/family_name") != query("family/family_name"))
                return RANK_D->query_respect(me) + "和本派素无瓜葛，何出此言？";

        if (me->query_skill("qiankun-jian", 1) < 1)
                return "你连乾坤神剑都没学，还谈什么绝招可言？";

        if (me->query("gongxian") < 1500)
                return "你对本派所作出的贡献不够，这一招我暂时还不能传你。";

        if (me->query_skill("force") < 220)
                return "你的内功火候不足，学不了这一招！";

        if (me->query_skill("qiankun-jian", 1) < 150)
                return "你的乾坤神剑修为还不够，自己下去练练再来吧。";

        message_vision(HIY "$n" HIY "点了点头，道：我将这招给你演示一"
                       "遍，你可看好了。$n" HIY "话\n音刚落，只见他身"
                       "形一展，以指作剑，指尖微颤，将乾坤剑法连环施而"
                       "\n出。$N" HIY "霎时只觉剑影重重，直看得眼花缭"
                       "乱。\n" NOR, me, this_object());
        command("nod");
        command("say 这便是日月乾坤，你看懂了多少？");
        tell_object(me, HIC "你学会了「日月乾坤」。\n" NOR);

        if (me->can_improve_skill("sword"))
                me->improve_skill("sword", 1500000);
        if (me->can_improve_skill("qiankun-jian"))
                me->improve_skill("qiankun-jian", 1500000);
        me->improve_skill("martial-cognize", 1500000);
        me->set("can_perform/qiankun-jian/riyue", 1);
        me->add("gongxian", -1500);

        return 1;
}

mixed ask_skill3()
{
        object me;

        me = this_player();

        if (me->query("can_perform/qiankun-jian/ni"))
                return "咦？这招你不是已经会了吗？";

        if (me->query("family/family_name") != query("family/family_name"))
                return RANK_D->query_respect(me) + "和本派素无瓜葛，何出此言？";

        if (me->query_skill("qiankun-jian", 1) < 1)
                return "你连乾坤神剑都没学，还谈什么绝招可言？";

        if (me->query("gongxian") < 1800)
                return "你对本派所作出的贡献不够，这一招我暂时还不能传你。";

        if (! me->query("can_perform/qiankun-jian/qian"))
                return "要学此招，必须先通晓「乾坤劲」的奥秘。";

        if (me->query_skill("force") < 300)
                return "你的内功火候不足，学不了这一招！";

        if (me->query_skill("qiankun-jian", 1) < 180)
                return "你的乾坤神剑修为还不够，自己下去练练再来吧。";

        message_vision(HIW "$n" HIW "微笑道：既然你的剑术已经到达超凡的"
                       "境界，今日我就传你这招。\n$n" HIW "说着“刷”的"
                       "一声响，从背负的瑶琴底下抽出一柄长剑，纵身近\n前"
                       "，长剑陡然弯弯弹出，剑尖直刺$N" HIW "胸口，出招"
                       "之快真乃为任何剑法所\n不及。$N" HIW "顿时措手不"
                       "及，当场呆立，完全不知道该如何应招。$n" HIW "哈"
                       "\n哈一笑，收起长剑，说道：刚才这一招不是直刺，却"
                       "是先聚内力，然后\n蓄劲弹出。这逆转乾坤的奥秘便是"
                       "将乾坤剑法逆行施展即可。\n" NOR, me,
                       this_object());
        command("haha");
        command("say 这招乃是乾坤神剑的精髓，你下去后自己勤加练习吧。");
        tell_object(me, HIC "你学会了「逆转乾坤」。\n" NOR);

        if (me->can_improve_skill("force"))
                me->improve_skill("force", 1500000);
        if (me->can_improve_skill("liangyi-shengong"))
                me->improve_skill("liangyi-shengong", 1500000);
        if (me->can_improve_skill("sword"))
                me->improve_skill("sword", 1500000);
        if (me->can_improve_skill("qiankun-jian"))
                me->improve_skill("qiankun-jian", 1500000);
        me->improve_skill("martial-cognize", 1500000);
        me->set("can_perform/qiankun-jian/ni", 1);
        me->add("gongxian", -1800);

        return 1;
}

mixed ask_skill4()
{
        object me;

        me = this_player();

        if (me->query("can_perform/kunlun-zhang/kong"))
                return "咦？这招你不是已经会了吗？";

        if (me->query("family/family_name") != query("family/family_name"))
                return RANK_D->query_respect(me) + "和本派素无瓜葛，何出此言？";

        if (me->query_skill("kunlun-zhang", 1) < 1)
                return "你连昆仑掌法都没学，还谈什么绝招可言？";

        if (me->query("gongxian") < 600)
                return "你对本派所作出的贡献不够，这一招我暂时还不能传你。";

        if (me->query_skill("force") < 150)
                return "你的内功火候不足，学不了这一招！";

        if (me->query_skill("kunlun-zhang", 1) < 120)
                return "你的昆仑掌法修为还不够，自己下去练练再来吧。";

        message_vision(HIY "$n" HIY "点了点头，将$N" HIY "招至"
                       "身边，在耳旁低声细说良久，$N" HIY "听"
                       "后会心的\n一笑，看来大有所悟。\n" NOR, me,
                       this_object());
        command("nod");
        command("say 刚才我所说的便是日入空山的精要，你可记清了？");
        tell_object(me, HIC "你学会了「日入空山」。\n" NOR);

        if (me->can_improve_skill("strike"))
                me->improve_skill("strike", 1500000);
        if (me->can_improve_skill("kunlun-zhang"))
                me->improve_skill("kunlun-zhang", 1500000);
        me->improve_skill("martial-cognize", 1500000);
        me->set("can_perform/kunlun-zhang/kong", 1);
        me->add("gongxian", -600);

        return 1;
}

mixed ask_jian()
{
        object me;
        object ob;
        object owner;

        me = this_player();

        if (me->query("family/family_name") != "昆仑派")
                return "阁下素来和本派并无渊源，何故来打听我的随身之物？";

        if (me->query("family/master_id") != query("id"))
                return "只有我的弟子才有资格使用我的随身宝剑，阁下还是请回吧。";

        if (me->query_skill("qiankun-jian", 1) < 150)
                return "等你剑术大成之日，我自然不会吝惜佩剑，你再下去练练吧。";

        if (me->query_skill("tanqin-jifa", 1) < 120
           && me->query_skill("chess", 1) < 120)
                return "你跟了我这么久，琴和棋却是这般…唉。";

        ob = find_object(LIANGJI);
        if (! ob) ob = load_object(LIANGJI);
        owner = environment(ob);

        while (owner)
        {
                if (owner->is_character() || ! environment(owner))
                        break;
                owner = environment(owner);
        }

        if (owner == me)
                return "我的佩剑不正是你拿着在用吗，为何还反倒问起我来了？";

        if (objectp(owner) && owner != this_object())
        {
                if (! owner->is_character())
                        return "你来晚了，我的两极剑现在并不在我手中。";

                if (owner->query("family/family_name") == "昆仑派")
                        return "我的佩剑现在暂时是你同门" + owner->query("name") +
                               "在用，你要用就去找他吧。";
                else
                        return "我的那柄两极剑现在落在了" + owner->query("name") +
                               "手中，你去把它找回来吧。";
        }
        ob->move(this_object());
        command("give liangji jian to " + me->query("id"));

        ob = new("clone/weapon/changjian");
        ob->move(this_object());
        ob->wield();

        return "既然这样，我这柄两极剑你就暂时拿去用吧。";
}

int accept_object(object me, object ob)
{
        if (base_name(ob) != LIANGJI)
        {
                command("say 你给我这种东西干什么？");
                return 0;
        }

        if (me->query("family/master_id") != query("id"))
                command("say 多谢这位" + RANK_D->query_respect(me) +
                        "将我的宝剑交回。");
        else
                command("say 很好，很好！");
        destruct(ob);
        return 1;
}

void init()
{
        object ob;

        if (interactive(ob = this_player())
           && ! is_fighting() && random(10) < 3)
        {
                remove_call_out("greeting");
                call_out("greeting", 1, ob);
        }    
}

void greeting(object ob)
{ 
        if (! ob || environment(ob) != environment())
                return;

        command("play jian-jia");
        return;
}

