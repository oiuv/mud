#include <ansi.h>
#include "kunlun.h"

#define TIEQIN    "/clone/lonely/tieqin"
#define JIANJING  "/clone/lonely/book/xunleijian"

inherit NPC;
inherit F_MASTER;
inherit F_COAGENT;
inherit F_QUESTER;

mixed ask_skill1();
mixed ask_skill2();
mixed ask_skill3();
mixed ask_skill4();
mixed ask_skill5();
mixed ask_jian();
mixed ask_jing();

void create()
{
        object ob;
	set_name("何太冲", ({"he taichong", "he", "taichong"}));
        set("long", @LONG
他就是名扬江湖的昆仑派第四代掌门铁琴先生
何太冲。虽然此时他年纪已大，但仍然看得出
他年轻时的英俊潇洒。
LONG);
	set("nickname", WHT "铁琴先生" NOR);
	set("gender", "男性");
	set("age", 43);
	set("attitude", "heroism");
	set("shen_type", 0);
	set("str", 25);
	set("int", 25);
	set("con", 25);
	set("dex", 25);
        set("max_qi", 5000);
        set("max_jing", 3000);
        set("neili", 6000);
        set("max_neili", 6000);
        set("jiali", 150);
        set("combat_exp", 1600000);

        set_skill("force", 220);
        set_skill("kunlun-xinfa", 200);
        set_skill("liangyi-shengong", 220);
        set_skill("dodge", 200);
        set_skill("chuanyun-bu", 200);
        set_skill("hand", 200);
        set_skill("sanyin-shou", 200);
        set_skill("cuff", 200);
        set_skill("zhentian-quan", 200);
        set_skill("parry", 200);
        set_skill("sword", 220);
        set_skill("kunlun-jian", 220);
        set_skill("xunlei-jian", 220);
        set_skill("zhengliangyi-jian", 220);
        set_skill("throwing", 200);
        set_skill("kunlun-qifa", 200);
        set_skill("tanqin-jifa", 240);
        set_skill("tieqin-yin", 240);
        set_skill("literate", 220);
        set_skill("martial-cognize", 200);

        map_skill("force", "liangyi-shengong");
        map_skill("dodge", "chuanyun-bu");
        map_skill("parry", "zhengliangyi-jian");
        map_skill("sword", "kunlun-jian");
        map_skill("cuff", "zhentian-quan");
        map_skill("hand", "sanyin-shou");
        map_skill("throwing", "kunlun-qifa");
        map_skill("tanqin-jifa", "tieqin-yin");

        prepare_skill("strike", "kunlun-zhang");
        prepare_skill("cuff", "zhentian-quan");

        create_family("昆仑派", 4, "掌门");

        set("inquiry", ([
                "绝招"      : "你要问什么绝招？",
                "绝技"      : "你要问什么绝技？",
                "损筋诀"    : "嗯，这招你去找我内子求教吧。",
                "无声无色"  : "嗯，这招你去找我内子求教吧。",
                "石破天惊"  : (: ask_skill1 :),
                "流星电闪"  : (: ask_skill2 :),
                "迅雷一击"  : (: ask_skill3 :),
                "域外梵音"  : (: ask_skill4 :),
                "玉碎昆冈"  : (: ask_skill5 :),
                "铁琴剑"    : (: ask_jian :),
                "剑经"      : (: ask_jing :),
                "迅雷剑经"  : (: ask_jing :),
        ]));

        set("chat_chance_combat", 100);
        set("chat_msg_combat", ({
                (: perform_action, "sword.fanyin" :),
                (: perform_action, "throwing.liu" :),
                (: perform_action, "cuff.shi" :),
                (: perform_action, "hand.sun" :),
                (: exert_function, "recover" :),
                (: exert_function, "powerup" :),

        }) );

	setup();

        if (clonep())
        {
                ob = find_object(TIEQIN);
                if (! ob) ob = load_object(TIEQIN);
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
}

void attempt_apprentice(object me)
{
        if (! permit_recruit(me))
                return;

        if (me->query("gender") == "女性")
        {
                command("say 我不收女徒弟，你去找我夫人好了。");
                return;
        }

        if ((int)me->query("combat_exp") < 150000)
        {
                command("say 你的江湖经验太浅，还是锻炼锻炼再说吧。");
                return;
        }

        if ((int)me->query_skill("kunlun-xinfa", 1) < 80)
        {
		command("say 你对本门的内功心法所知尚浅，练习高了再来找我吧。");
		return;
	}

	command("say 既然你如此有心，我便收下你，希望你能够有所作为。");
        command("recruit " + me->query("id"));
}

mixed ask_skill1()
{
        object me;

        me = this_player();

        if (me->query("can_perform/zhentian-quan/shi"))
                return "咦？这招你不是已经会了吗？";

        if (me->query("family/family_name") != query("family/family_name"))
                return RANK_D->query_respect(me) + "和本派素无瓜葛，何出此言？";

        if (me->query_skill("zhentian-quan", 1) < 1)
                return "你连震天拳法都没学，还谈什么绝招可言？";

        if (me->query("gongxian") < 100)
                return "你对本派所作出的贡献不够，这一招我暂时还不能传你。";

        if (me->query_skill("zhentian-quan", 1) < 80)
                return "你的震天拳法修为还不够，自己下去练练再来吧。";

        message_vision(HIY "$n" HIY "略微点了点头，说道：我这给你"
                       "演示一遍，你可要看好了。\n说完便只见$n" HIY
                       "拉开架式，提运内劲，聚力于掌一拳挥出，顿\n"
                       "时$N" HIY "周围呼啸声骤起，气势当真有如石"
                       "破天惊。\n" NOR, me, this_object());
        command("nod");
        command("say 这招石破天惊招式并不复杂，下去稍加练习便成。");
        tell_object(me, HIC "你学会了「石破天惊」。\n" NOR);

        if (me->can_improve_skill("cuff"))
                me->improve_skill("cuff", 1500000);
        if (me->can_improve_skill("zhentian-quan"))
                me->improve_skill("zhentian-quan", 1500000);
        me->improve_skill("martial-cognize", 1500000);
        me->set("can_perform/zhentian-quan/shi", 1);
        me->add("gongxian", -100);

        return 1;
}

mixed ask_skill2()
{
        object me;

        me = this_player();

        if (me->query("can_perform/kunlun-qifa/liu"))
                return "咦？这招你不是已经会了吗？";

        if (me->query("family/family_name") != query("family/family_name"))
                return RANK_D->query_respect(me) + "和本派素无瓜葛，何出此言？";

        if (me->query_skill("kunlun-qifa", 1) < 1)
                return "你连昆仑器法都没学，还谈什么绝招可言？";

        if (me->query("gongxian") < 300)
                return "你对本派所作出的贡献不够，这一招我暂时还不能传你。";

        if (me->query_skill("force") < 200)
                return "你的内功修为怎么这么差？练好了再来吧！";

        if (me->query_skill("kunlun-qifa", 1) < 120)
                return "你的昆仑器法修为还不够，自己下去练练再来吧。";

        message_vision(HIY "$n" HIY "凝视了$N" HIY "一会，干咳了一"
                       "声，其余弟子会意连忙全部退下。\n$n" HIY "这"
                       "才将$N" HIY "招到面前，在$N" HIY "耳边轻声"
                       "嘀咕了些话，$N" HIY "一边听\n一边不住的点头"
                       "，看来对$n" HIY "的教导大有所悟。\n" NOR,
                       me, this_object());
        command("nod");
        command("say 这招流星电闪用来偷袭和暗算敌人很有效，你多练练吧！");
        tell_object(me, HIC "你学会了「流星电闪」。\n" NOR);

        if (me->can_improve_skill("throwing"))
                me->improve_skill("throwing", 1500000);
        if (me->can_improve_skill("kunlun-qifa"))
                me->improve_skill("kunlun-qifa", 1500000);
        me->improve_skill("martial-cognize", 1500000);
        me->set("can_perform/kunlun-qifa/liu", 1);
        me->add("gongxian", -300);

        return 1;
}

mixed ask_skill3()
{
        object me;

        me = this_player();

        if (me->query("can_perform/xunlei-jian/xun"))
                return "这招我已经解释得很清楚了，还有什么不懂就自己下去练！";

        if (me->query("family/family_name") != query("family/family_name"))
                return RANK_D->query_respect(me) + "和本派素无瓜葛，何出此言？";

        if (me->query_skill("xunlei-jian", 1) < 1)
                return "你连迅雷剑法都没学，还谈什么绝招可言？";

        if (me->query("gongxian") < 50)
                return "你对本派所作出的贡献不够，这一招我暂时还不能传你。";

        if (me->query_skill("force") < 150)
                return "你的内功火候不足，学不了这一招！";

        if (me->query_skill("xunlei-jian", 1) < 100)
                return "你的迅雷剑法修为还不够，自己下去练练再来吧。";

        message_vision(HIY "$n" HIY "点了点头，随手从身后的书架上取"
                       "出一本剑经，指着其中\n一段对$N" HIY "细说了"
                       "良久，$N" HIY "一边听一边点头。\n" NOR, me,
                       this_object());
        command("nod");
        command("say 刚才我所说的便是这迅雷一击的精髓，你自己下去练吧。");
        tell_object(me, HIC "你学会了「迅雷一击」。\n" NOR);

        if (me->can_improve_skill("sword"))
                me->improve_skill("sword", 1500000);
        if (me->can_improve_skill("xunlei-jian"))
                me->improve_skill("xunlei-jian", 1500000);
        me->improve_skill("martial-cognize", 1500000);
        me->set("can_perform/xunlei-jian/xun", 1);
        me->add("gongxian", -50);

        return 1;
}

mixed ask_skill4()
{
        object me;

        me = this_player();

        if (me->query("can_perform/kunlun-jian/fanyin"))
                return "给我自己下去练，少跟我纠缠不休！";

        if (me->query("family/family_name") != query("family/family_name"))
                return RANK_D->query_respect(me) + "和本派素无瓜葛，何出此言？";

        if (me->query_skill("kunlun-jian", 1) < 1)
                return "你连昆仑剑法都没学，还谈什么绝招可言？";

        if (me->query("gongxian") < 1000)
                return "你对本派所作出的贡献不够，这一招我暂时还不能传你。";

        if (me->query_skill("force") < 200)
                return "你的内功火候不足，学不了这一招！";

        if (me->query_skill("tanqin-jifa", 1) < 120)
                return "你的弹琴技法尚且不够熟练, 学不了这一招！";

        if (me->query_skill("kunlun-jian", 1) < 130)
                return "你的昆仑剑法修为还不够，自己下去练练再来吧。";

        message_vision(HIY "$n" HIY "凝视了$N" HIY "半天，说道：“既"
                       "然你剑术已成，我今日便\n传你这招吧。其余不相"
                       "干的人都给我出去！”待其余弟子退\n下后，$n"
                       HIY "警惕的望了望四周，确定四下没人后，这才从"
                       "\n铁琴下抽出一柄长剑，慢慢的演示剑招。$N" HIY
                       "只觉剑招精妙奇\n巧，实乃前所谓闻。\n" NOR, me,
                       this_object());
        command("nod");
        command("say 这招你下去后找个僻静之地勤加练习，可千万别泄露出去。");
        tell_object(me, HIC "你学会了「域外梵音」。\n" NOR);

        if (me->can_improve_skill("tanqin-jifa"))
                me->improve_skill("tanqin-jifa", 1500000);
        if (me->can_improve_skill("sword"))
                me->improve_skill("sword", 1500000);
        if (me->can_improve_skill("kunlun-jian"))
                me->improve_skill("kunlun-jian", 1500000);
        me->improve_skill("martial-cognize", 1500000);
        me->set("can_perform/kunlun-jian/fanyin", 1);
        me->add("gongxian", -1000);

        return 1;
}

mixed ask_skill5()
{
        object me;

        me = this_player();

        if (me->query("can_perform/zhengliangyi-jian/sui"))
                return "自己下去练，别老跟我纠缠不休！";

        if (me->query("family/family_name") != query("family/family_name"))
                return RANK_D->query_respect(me) + "和本派素无瓜葛，何出此言？";

        if (me->query_skill("zhengliangyi-jian", 1) < 1)
                return "你连正两仪剑法都没学，还谈什么绝招可言？";

        if (me->query("gongxian") < 800)
                return "你对本派所作出的贡献不够，这一招我暂时还不能传你。";

        if (me->query_skill("force") < 250)
                return "你的内功火候不足，学不了这一招。";

        if (me->query("max_neili") < 3000)
                return "你的内力修为不足，学不了这一招。";

        if (me->query_skill("zhengliangyi-jian", 1) < 180)
                return "你的正两仪剑法修为还不够，自己下去练练再来吧。";

        message_vision(HIY "$n" HIY "眉头微微一皱，一挥手，示意其它弟"
                       "子全部出去。待\n其余弟子陆续退下后，$n" HIY "谨"
                       "慎的环顾下四周，确定四下\n没人后，这才将$N" HIY
                       "招至身边，悄声在$N" HIY "耳旁细说良久。待授\n招"
                       "完毕后，$n" HIY "又缓缓的摇了摇头，接着道：这一"
                       "招乃是\n宁为玉碎，不为瓦全的拼死一击，使用前一"
                       "定要慎重考虑。\n" NOR, me, this_object());
        command("sigh");
        command("say 行了，你自己下去练吧。");
        tell_object(me, HIC "你学会了「玉碎昆冈」。\n" NOR);

        if (me->can_improve_skill("sword"))
                me->improve_skill("sword", 1500000);
        if (me->can_improve_skill("zhengliangyi-jian"))
                me->improve_skill("zhengliangyi-jian", 1500000);
        me->improve_skill("martial-cognize", 1500000);
        me->set("can_perform/zhengliangyi-jian/sui", 1);
        me->add("gongxian", -800);

        return 1;
}

mixed ask_jian()
{
        object me;
        object ob;

        me = this_player();

        if (me->query("family/family_name") != "昆仑派")
                return "你是哪里来的？少在这里跟我罗嗦！";

        if (me->query("family/master_id") != "he zudao" &&
            me->query("family/master_id") != "ban shuxian" &&
            me->query("family/master_id") != "he taichong")
                return "哼！你还没有资格使用我的宝剑。";

        if (me->query_skill("kunlun-jian", 1) < 150)
                return "还不快给我滚回去用心练剑，少在这里罗嗦！";

        if (me->query_skill("tanqin-jifa", 1) < 100)
                return "你连琴都弹不好，还用什么铁琴剑？";

        if (present("tieqin jian", me))
                return "我的铁琴剑现在不就在你手里吗？";

        ob = present("tieqin jian", this_object());

        if (! objectp(ob))
                return "你来晚了，铁琴剑现在不在我这里。";

        message_vision("$N拿出" WHT "铁琴剑" NOR "(tieqin jian)给$n。\n",
                       this_object(), me);
        ob->move(me, 1);

        ob = new("clone/weapon/changjian");
        ob->move(this_object());
        ob->wield();

        return "我这柄铁琴剑你就暂且拿去吧，多用它扬扬我们昆仑派的威风。";
}

mixed ask_jing()
{
        object me;
        object ob;
        object owner;

        me = this_player();
        if (me->query("family/family_name") != "昆仑派")
                return "你是哪里来的？少在这里跟我罗嗦！";

        if (me->query_skill("xunlei-jian", 1) > 120)
                return "你的迅雷剑法已经到这个地步，没必要再去参读剑经了。";

        if (me->query_skill("sword", 1) < 30)
                return "你的剑法这么差，还读不懂剑经，练高点再来吧。";

        ob = find_object(JIANJING);
        if (! ob) ob = load_object(JIANJING);
        owner = environment(ob);
        while (owner)
        {
                if (owner->is_character() || ! environment(owner))
                        break;
                owner = environment(owner);
        }

        if (owner == me)
                return "我不是已经把剑经给你了吗，难道是弄丢了？";

        if (objectp(owner) && owner != this_object())
        {
                if (! owner->is_character())
                        return "你来晚了一步，那本「迅雷剑经」已经让你同门师兄拿去了。";

                if (owner->query("family/family_name") == "昆仑派")
                        return "那本「迅雷剑经」现在在你同门" + owner->query("name") +
                               "手中，你要用就去找他吧。";
                else
                        return "你来得正好，我正为此担忧呢。听说剑经落入" +
                               owner->query("name") + "手中，你去把他做了，抢回剑经！";
        }

        ob->move(this_object());
        message_vision(CYN "$N" CYN "说道：既然如此，这本「迅雷剑经」今日我便"
                       "交与你，可别弄丢了。\n" NOR, this_object(), me);
        command("give xunlei jianjing to " + me->query("id"));
        return 1;
}

void unconcious()
{
        die();
}
