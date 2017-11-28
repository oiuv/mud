#include <ansi.h>
#include "hu.h"

#define LENGYUE  "/clone/lonely/lengyuedao"
#define JUNDAO   "/clone/lonely/jundao"
#define QUANJING "/clone/lonely/book/hujia1"
#define DAOPU    "/clone/lonely/book/hujia2"

inherit NPC;
inherit F_MASTER;
inherit F_COAGENT;
inherit F_QUESTER;

mixed ask_baodao();
mixed ask_jundao();
mixed ask_quanjing();
mixed ask_daopu();

mixed ask_skill1();
mixed ask_skill2();
mixed ask_skill3();
mixed ask_skill4();
mixed ask_skill5();
mixed ask_skill6();
mixed ask_skill7();
mixed ask_skill8();
mixed ask_skill9();
mixed ask_skill10();
mixed ask_skill11();

mixed  try_to_learn_baishengdao();
mixed  try_to_learn_hujiadao();
mixed  try_to_learn_sixiangbu();

void create()
{
        object ob;
        set_name("胡斐", ({"hu fei", "hu", "fei"}));
        set("gender", "男性");
        set("nickname", HIW "雪山飞狐" NOR);
        set("age", 25);
        set("long", @LONG
他就是胡一刀之子胡斐，因其武功高强神出鬼
没。在江湖上人送外号「雪山飞狐」。他身穿
一件白色长衫，腰间别着一把看起来很旧的刀。
满腮虬髯，根根如铁，一头浓发，却不结辫。
LONG);
        set("attitude", "peaceful");
        set("shen_type", 1);
        set("str", 45);
        set("int", 30);
        set("con", 30);
        set("dex", 30);

        set("qi", 5200);
        set("max_qi", 5200);
        set("jing", 3500);
        set("max_jing", 3500);
        set("neili", 6500);
        set("max_neili", 6500);
        set("jiali", 180);
        set("combat_exp", 4000000);
        set("score", 20000);

        set_skill("force", 240);
        set_skill("lengyue-shengong", 240);
        set_skill("blade", 260);
        set_skill("liuhe-dao", 260);
        set_skill("chuangwang-dao", 260);
        set_skill("baisheng-daofa", 260);
        set_skill("hujia-daofa", 260);
        set_skill("dodge", 260);
        set_skill("sixiang-bufa", 260);
        set_skill("parry", 240);
        set_skill("throwing", 260);
        set_skill("mantian-xing", 260);
        set_skill("strike", 240);
        set_skill("liuhe-zhang", 240);
        set_skill("chuncan-zhang", 240);
        set_skill("cuff", 240);
        set_skill("hua-quan", 240);
        set_skill("hujia-quan", 240);
        set_skill("literate", 180);
        set_skill("martial-cognize", 240);

        map_skill("force", "lengyue-shengong");
        map_skill("blade", "hujia-daofa");
        map_skill("dodge", "sixiang-bufa");
        map_skill("parry", "hujia-daofa");
        map_skill("throwing", "mantian-xing");
        map_skill("strike", "chuncan-zhang");
        map_skill("cuff", "hujia-quan");

        prepare_skill("strike", "chuncan-zhang");
        prepare_skill("cuff",   "hujia-quan");

        set("no_teach", ([
                "baisheng-daofa" : (: try_to_learn_baishengdao :),
                "hujia-daofa"    : (: try_to_learn_hujiadao :),
                "sixiang-bufa"   : (: try_to_learn_sixiangbu :),
        ]));

        create_family("关外胡家", 7, "传人");

        set("inquiry", ([
                "冷月宝刀"   : (: ask_baodao :),
                "闯王军刀"   : (: ask_jundao :),
                "胡家拳经"   : (: ask_quanjing :),
                "胡家刀谱"   : (: ask_daopu :),
                "风卷霹雳"   : (: ask_skill1 :),
                "风卷霹雳上九天" : (: ask_skill1 :),
                "奔拳快打"   : (: ask_skill2 :),
                "乌龙探海"   : (: ask_skill3 :),
                "作茧自缚"   : (: ask_skill4 :),
                "飞天神行"   : (: ask_skill5 :),
                "星光闪烁"   : (: ask_skill6 :),
                "雄霸群山"   : (: ask_skill7 :),
                "闪刀诀"     : (: ask_skill8 :),
                "推天献印势" : (: ask_skill9 :),
                "卸甲锥心势" : (: ask_skill10 :),
                "八方藏刀势" : (: ask_skill11 :),
                "穹外飞星"   : "这招只有你自己去领悟。",
                "横扫千军"   : "咦？这是什么招数，我没听说过。",
                "袁紫衣"     : "算了，别提这伤心事了。",
                "阎基"       : "阎基这个狗贼我非杀了他不可。",
                "赵半山"     : "我赵三哥啊！他刚来关外看我呢。 ",
                "苗若兰"     : "不知什么时候还能再见到若兰姑娘。",
                "若兰"       : "不知什么时候还能再见到若兰姑娘。",
                "胡一刀"     : "辽东大侠胡一刀是我爹。不过我从没见过他。",
                "程灵素"     : "现在我也不知道她在哪里，只是曾经听她说过好像要去襄阳。",
                "苗人凤"     : "苗人凤和家父齐名，本可成为知交好友，然而家父却死在他的剑下。"
        ]));

        set("chat_chance_combat", 120);
        set("chat_msg_combat", ({
	        (: perform_action, "blade.xian" :),
	        (: perform_action, "blade.zhui" :),
	        (: perform_action, "blade.cang" :),
	        (: perform_action, "cuff.kuai" :),
	        (: perform_action, "strike.jian" :),
	        (: perform_action, "dodge.fei" :),
	        (: perform_action, "throwing.shan" :),
	        (: perform_action, "throwing.xing" :),
	        (: exert_function, "recover" :),
	        (: exert_function, "powerup" :),
        }));

        set_temp("apply/damage", 100);
        set_temp("apply/unarmed_damage", 100);
        set_temp("apply/armor", 200);

        setup();

        if (clonep())
        {
                ob = find_object(LENGYUE);
                if (! ob) ob = load_object(LENGYUE);
                if (! environment(ob))
                {
                        ob->move(this_object());
                        ob->wield();
                } else
                {
                        ob = find_object(JUNDAO);
                        if (! ob) ob = load_object(JUNDAO);
                        if (! environment(ob))
                        {
                                ob->move(this_object());
                                ob->wield();
                        } else
                        {
                                ob = new("/clone/weapon/gangdao");
                                ob->move(this_object());
                                ob->wield();
                        }
                }
        }

        carry_object("/clone/cloth/cloth")->wear();
}

void attempt_apprentice(object ob)
{
        if (! permit_recruit(ob))
                return;

        if (ob->name(1) == "胡一刀")
        {
                command("say 我操！你想做我的老子啊？");
                return;
        }

        if (ob->name(1) == "胡斐")
        {
                command("say 他奶奶的！你咋也起这个名字？");
                return;
        }

        if (ob->name(1) == "胡子" || ob->name(1) == "胡臭")
        {
                command("say 你给换起个名字，现在这个名字也太龌龊了。");
                return;
        }

        command("recruit " + ob->query("id"));
        command("say 今日我便收下你，我们胡家还要靠你们来发扬光大！");
        return;
}

mixed try_to_learn_baishengdao()
{
        object ob = this_player();

        if (ob->query("can_learn/hufei/baisheng-daofa"))
                return 0;

        if (ob->query("combat_exp") > 100000)
        {
                command("say 不错，不错！今日我便传授你百胜刀法。");
                ob->set("can_learn/hufei/baisheng-daofa", 1);
                return 0;
        }

        return "你此时功力太浅，我还是先传授你一些简单的刀法。";
}

mixed try_to_learn_hujiadao()
{
        object ob = this_player();

        if (ob->query("can_learn/hufei/hujia-daofa"))
                return 0;

        if (ob->query("combat_exp") > 400000)
        {
                command("say 既然你能有如此造诣，我今日便传授你胡家刀法！");
                ob->set("can_learn/hufei/hujia-daofa", 1);
                return 0;
        }

        return "你的实战经验不足，尚难以领会这高深胡家刀法。";
}

mixed try_to_learn_sixiangbu()
{
        object ob = this_player();

        if (ob->query("can_learn/hufei/sixiang-bufa"))
                return 0;

        if (ob->query("combat_exp") > 50000)
        {
                command("say 看来你武功已经有了一定的基础，今日我就传你四象步法。");
                ob->set("can_learn/hufei/sixiang-bufa", 1);
                return 0;
        }

        return "四象步法对你来说过于艰深，你还是先奠定好基础再说。";
}

mixed ask_skill1()
{
        object me;

        me = this_player();

        if (me->query("can_perform/hua-quan/juan"))
                return "俺不是已经教过你了吗？还多说什么？";

        if (me->query("family/family_name") != query("family/family_name"))
                return "你又不是俺胡家的，还和我罗嗦什么？";

        if (me->query_skill("hua-quan", 1) < 1)
                return "你连西岳华拳都未曾学过，哪里来绝招？";

        if (me->query("gongxian") < 350)
                return "你在我胡家碌碌无为，这招我先不忙传你。";

        if (me->query("shen") < 5000)
                return "你侠义正事做得不够，这招我先不忙传你。";

        if (me->query_skill("force") < 180)
                return "你的内功火候不足，学不成这招。";

        if (me->query_skill("hua-quan", 1) < 120)
                return "你的西岳华拳火候未到，还得多练习练习。";

        message_vision(HIY "$n" HIY "点了点头，说道：“我先将这华拳的总"
                       "诀传授予你，需得慢慢\n领会。”说完便听得$n" HIY
                       "朗诵道：“风卷霹雳上九天，晓星当头即\n走拳。出"
                       "势跨虎西岳传，金鹏展翅庭中站。韦陀献抱在胸前，"
                       "把臂\n拦门横铁闩。魁鬼仰斗撩绿栏，出势跨虎西岳"
                       "传。白猿偷桃拜天庭，\n吴王试剑劈玉砖……”$N" HIY
                       "在一旁细细捉摸。如此这般，过了良久。\n" NOR, me,
                       this_object());
        command("nod");
        command("say 我曾以华拳门掌门的身份参加掌门人大会，那次……");
        command("sigh");
        command("say 这西岳华拳创于唐朝，威力的确不凡，可得多花功夫练习。");
        tell_object(me, HIC "你学会了「风卷霹雳上九天」。\n" NOR);

        if (me->can_improve_skill("cuff"))
                me->improve_skill("cuff", 1500000);
        if (me->can_improve_skill("hua-quan"))
                me->improve_skill("hua-quan", 1500000);
        me->improve_skill("martial-cognize", 1500000);
        me->set("can_perform/hua-quan/juan", 1);
        me->add("gongxian", -350);
        return 1;
}

mixed ask_skill2()
{
        object me;

        me = this_player();

        if (me->query("can_perform/hujia-quan/kuai"))
                return "俺不是已经教过你了吗？还多说什么？";

        if (me->query("family/family_name") != query("family/family_name"))
                return "你又不是俺胡家的，还和我罗嗦什么？";

        if (me->query_skill("hujia-quan", 1) < 1)
                return "你连胡家拳法都未曾学过，哪里来绝招？";

        if (me->query("gongxian") < 100)
                return "你在我胡家碌碌无为，这招我先不忙传你。";

        if (me->query("shen") < 2000)
                return "你侠义正事做得不够，这招我先不忙传你。";

        if (me->query_skill("force") < 100)
                return "你的内功火候不足，学不成这招。";

        if (me->query_skill("hujia-quan", 1) < 80)
                return "你的胡家拳法火候未到，还得多练习练习。";

        message_vision(HIY "$n" HIY "略微点了点头，深深呼入一口气，纵"
                       "步上前，拳招迭出，疾如\n奔雷，霎时已向$N" HIY
                       "攻出数拳，招式甚为精妙。\n" NOR, me,
                       this_object());
        command("nod");
        command("say 看懂了吗？");
        tell_object(me, HIC "你学会了「奔拳快打」。\n" NOR);

        if (me->can_improve_skill("cuff"))
                me->improve_skill("cuff", 1500000);
        if (me->can_improve_skill("hujia-quan"))
                me->improve_skill("hujia-quan", 1500000);
        me->improve_skill("martial-cognize", 1500000);
        me->set("can_perform/hujia-quan/kuai", 1);
        me->add("gongxian", -100);
        return 1;
}

mixed ask_skill3()
{
        object me;

        me = this_player();

        if (me->query("can_perform/liuhe-zhang/tan"))
                return "俺不是已经教过你了吗？还多说什么？";

        if (me->query("family/family_name") != query("family/family_name"))
                return "你又不是俺胡家的，还和我罗嗦什么？";

        if (me->query_skill("liuhe-zhang", 1) < 1)
                return "你连六合掌法都未曾学过，哪里来绝招？";

        if (me->query("gongxian") < 50)
                return "你在我胡家碌碌无为，这招我先不忙传你。";

        if (me->query("shen") < 1500)
                return "你侠义正事做得不够，这招我先不忙传你。";

        if (me->query_skill("force") < 100)
                return "你的内功火候不足，学不成这招。";

        if (me->query_skill("liuhe-zhang", 1) < 60)
                return "你的六合掌法火候未到，还得多练习练习。";

        message_vision(HIY "$n" HIY "哈哈一笑，也不答话，忽然间单掌飕"
                       "的探出，正向$N" HIY "胸前拍落。\n$N" HIY "登时"
                       "大惊失色，急忙向后跃开数尺，可已然不及，$n" HIY
                       "的单掌正\n搭在$N" HIY "的胸部左侧。\n" NOR, me,
                       this_object());

        if ((string)me->query("gender") == "女性")
        {
                command("ah");
                command("say …对…对不住…俺…俺忘了你是女的。");
        } else
                command("haha");

        command("say 招式便是如此，自己下去练习吧。");
        tell_object(me, HIC "你学会了「乌龙探海」。\n" NOR);

        if (me->can_improve_skill("strike"))
                me->improve_skill("strike", 1500000);
        if (me->can_improve_skill("liuhe-zhang"))
                me->improve_skill("liuhe-zhang", 1500000);
        me->improve_skill("martial-cognize", 1500000);
        me->set("can_perform/liuhe-zhang/tan", 1);
        me->add("gongxian", -50);
        return 1;
}

mixed ask_skill4()
{
        object me;

        me = this_player();

        if (me->query("can_perform/chuncan-zhang/jian"))
                return "俺不是已经教过你了吗？还多说什么？";

        if (me->query("family/family_name") != query("family/family_name"))
                return "你又不是俺胡家的，还和我罗嗦什么？";

        if (me->query_skill("chuncan-zhang", 1) < 1)
                return "你连春蚕掌法都未曾学过，哪里来绝招？";

        if (me->query("gongxian") < 400)
                return "你在我胡家碌碌无为，这招我先不忙传你。";

        if (me->query("shen") < 5000)
                return "你侠义正事做得不够，这招我先不忙传你。";

        if (me->query_skill("force") < 120)
                return "你的内功火候不足，学不成这招。";

        if (me->query_skill("chuncan-zhang", 1) < 80)
                return "你的春蚕掌法火候未到，还得多练习练习。";

        message_vision(HIY "$n" HIY "赞许地对$N" HIY "点了点头，说道："
                       "“我将这招给你演示一遍，可得\n瞧清楚了。”说完"
                       "只见$n" HIY "默默凝聚内力，掌劲吞吐不定，霎时"
                       "双\n掌掀起一层气劲，将周身经脉层层护住。\n" NOR,
                       me, this_object());

        command("nod");
        command("say 这招遇到强敌的时候很管用，当年我和苗人凤一战便全靠这套掌法。");
        tell_object(me, HIC "你学会了「作茧自缚」。\n" NOR);

        if (me->can_improve_skill("strike"))
                me->improve_skill("strike", 1500000);
        if (me->can_improve_skill("chuncan-zhang"))
                me->improve_skill("chuncan-zhang", 1500000);
        me->improve_skill("martial-cognize", 1500000);
        me->set("can_perform/chuncan-zhang/jian", 1);
        me->add("gongxian", -400);
        return 1;
}

mixed ask_skill5()
{
        object me;

        me = this_player();

        if (me->query("can_perform/sixiang-bufa/fei"))
                return "俺不是已经教过你了吗？还多说什么？";

        if (me->query("family/family_name") != query("family/family_name"))
                return "你又不是俺胡家的，还和我罗嗦什么？";

        if (me->query_skill("sixiang-bufa", 1) < 1)
                return "你连四象步法都未曾学过，还神行什么？";

        if (me->query("gongxian") < 1000)
                return "你在我胡家碌碌无为，这招我先不忙传你。";

        if (me->query("shen") < 12000)
                return "你侠义正事做得不够，这招我先不忙传你。";

        if (me->query_skill("force", 1) < 150)
                return "你的内功火候不足，学不成这招。";

        if (me->query("max_neili") < 1000)
                return "你的内力修为不够，修炼高了再来。";

        if (me->query_skill("dodge", 1) < 150)
                return "你的基本轻功有待提高，暂时还学不成这招。";

        if (me->query_dex() < 33)
                return "你的身法太差，还需多加练习。";

        if (me->query_skill("sixiang-bufa", 1) < 150)
                return "你的四象步法火候未到，还得多练习练习。";

        message_vision(HIY "$n" HIY "对$N" HIY "点了点头，喝道：“看"
                       "好了。”话音刚落，只见$n" HIY "足尖\n轻点地面"
                       "，凌空一跃而起，身形顿时变得飘忽不定，难以捉"
                       "摸。$N" HIY "\n越看越觉精奇，不禁暗自感叹。\n"
                       NOR, me, this_object());

        command("haha");
        command("say 可看明白了？");
        tell_object(me, HIC "你学会了「飞天神行」。\n" NOR);

        if (me->can_improve_skill("dodge"))
                me->improve_skill("dodge", 1500000);
        if (me->can_improve_skill("sixiang-bufa"))
                me->improve_skill("sixiang-bufa", 1500000);
        me->improve_skill("martial-cognize", 1500000);
        me->set("can_perform/sixiang-bufa/fei", 1);
        me->add("gongxian", -1000);
        return 1;
}

mixed ask_skill6()
{
        object me;

        me = this_player();

        if (me->query("can_perform/mantian-xing/shan"))
                return "俺不是已经教过你了吗？还多说什么？";

        if (me->query("family/family_name") != query("family/family_name"))
                return "你又不是俺胡家的，还和我罗嗦什么？";

        if (me->query_skill("mantian-xing", 1) < 1)
                return "你连满天星都未曾学过，哪里来绝招？";

        if (me->query("gongxian") < 200)
                return "你在我胡家碌碌无为，这招我先不忙传你。";

        if (me->query("shen") < 3000)
                return "你侠义正事做得不够，这招我先不忙传你。";

        if (me->query_skill("force") < 100)
                return "你的内功火候不足，学不成这招。";

        if (me->query_skill("mantian-xing", 1) < 100)
                return "你的满天星火候未到，还得多练习练习。";

        message_vision(HIY "$n" HIY "哈哈一笑，将$N" HIY "招至跟前，轻"
                       "声在耳旁细声讲解满天星暗器手\n法的诸多要点。随"
                       "后又伸出右手，十指箕张，一伸一缩，看样子是\n一"
                       "种很特别的暗器法门。\n" NOR, me, this_object());

        command("nod");
        command("say 刚才俺说的你都记住了吗？");
        tell_object(me, HIC "你学会了「星光闪烁」。\n" NOR);

        if (me->can_improve_skill("throwing"))
                me->improve_skill("throwing", 1500000);
        if (me->can_improve_skill("mantian-xing"))
                me->improve_skill("mantian-xing", 1500000);
        me->improve_skill("martial-cognize", 1500000);
        me->set("can_perform/mantian-xing/shan", 1);
        me->add("gongxian", -200);
        return 1;
}

mixed ask_skill7()
{
        object me;

        me = this_player();

        if (me->query("can_perform/chuangwang-dao/xiong"))
                return "俺不是已经教过你了吗？还多说什么？";

        if (me->query("family/family_name") != query("family/family_name"))
                return "你又不是俺胡家的，还和我罗嗦什么？";

        if (me->query_skill("chuangwang-dao", 1) < 1)
                return "你连闯王刀法都未曾学过，哪里来绝招？";

        if (me->query("gongxian") < 50)
                return "你在我胡家碌碌无为，这招我先不忙传你。";

        if (me->query("shen") < 500)
                return "你侠义正事做得不够，这招我先不忙传你。";

        if (me->query_skill("force") < 60)
                return "你的内功火候不足，学不成这招。";

        if (me->query_skill("chuangwang-dao", 1) < 40)
                return "你的闯王刀法火候未到，还得多练习练习。";

        message_vision(HIY "$n" HIY "笑了笑，伸手将$N" HIY "招到身前"
                       "，低声在$N" HIY "耳旁嘀咕了半天。然后\n又拔出"
                       "腰刀猛劈数下，似乎是一种颇为刚猛的刀诀。\n"
                       NOR, me, this_object());

        command("nod");
        command("say 这招是用于冲锋陷阵的，高手对抗却不多用。");
        tell_object(me, HIC "你学会了「雄霸群山」。\n" NOR);

        if (me->can_improve_skill("blade"))
                me->improve_skill("blade", 1500000);
        if (me->can_improve_skill("chuangwang-dao"))
                me->improve_skill("chuangwang-dao", 1500000);
        me->improve_skill("martial-cognize", 1500000);
        me->set("can_perform/chuangwang-dao/xiong", 1);
        me->add("gongxian", -50);
        return 1;
}

mixed ask_skill8()
{
        object me;

        me = this_player();

        if (me->query("can_perform/liuhe-dao/shan"))
                return "俺不是已经教过你了吗？还多说什么？";

        if (me->query("family/family_name") != query("family/family_name"))
                return "你又不是俺胡家的，还和我罗嗦什么？";

        if (me->query_skill("liuhe-dao", 1) < 1)
                return "你连六合刀法都未曾学过，哪里来绝招？";

        if (me->query("gongxian") < 200)
                return "你在我胡家碌碌无为，这招我先不忙传你。";

        if (me->query("shen") < 3500)
                return "你侠义正事做得不够，这招我先不忙传你。";

        if (me->query_skill("force") < 100)
                return "你的内功火候不足，学不成这招。";

        if (me->query_skill("liuhe-dao", 1) < 80)
                return "你的六合刀法火候未到，还得多练习练习。";

        message_vision(HIY "$n" HIY "对$N" HIY "笑了笑，拔出腰间佩刀"
                       "握在手中，说道：“这六合刀法的\n要诀不过是展"
                       "、抹、钩、剁、砍、劈六势，看好了。”说完便只"
                       "见\n$n" HIY "手中钢刀吞吐不定，形若游龙，势如"
                       "猛虎。接连变换了数种方\n位，最后哧的一声砍落"
                       "，刀身震得嗡嗡直响。\n" NOR, me, this_object());

        command("nod");
        command("say 只要掌握了四象六合的方位，这招便不难练习。");
        tell_object(me, HIC "你学会了「闪刀诀」。\n" NOR);

        if (me->can_improve_skill("blade"))
                me->improve_skill("blade", 1500000);
        if (me->can_improve_skill("liuhe-dao"))
                me->improve_skill("liuhe-dao", 1500000);
        me->improve_skill("martial-cognize", 1500000);
        me->set("can_perform/liuhe-dao/shan", 1);
        me->add("gongxian", -200);
        return 1;
}

mixed ask_skill9()
{
        object me;

        me = this_player();

        if (me->query("can_perform/hujia-daofa/xian"))
                return "俺不是已经教过你了吗？还多说什么？";

        if (me->query("family/family_name") != query("family/family_name"))
                return "你又不是俺胡家的，还和我罗嗦什么？";

        if (me->query_skill("hujia-daofa", 1) < 1)
                return "你连胡家刀法都未曾学过，哪里来绝招？";

        if (me->query("gongxian") < 900)
                return "你在我胡家碌碌无为，这招我先不忙传你。";

        if (me->query("shen") < 15000)
                return "你侠义正事做得不够，这招我先不忙传你。";

        if (me->query_skill("force") < 160)
                return "你的内功火候不足，学不成这招。";

        if (me->query_skill("hujia-daofa", 1) < 120)
                return "你的胡家刀法火候未到，还得多练习练习。";

        message_vision(HIY "$n" HIY "拔出腰间佩刀，握在手中。对$N" HIY "笑"
                       "道：“我便用这招攻你，看\n你如何抵挡。”说完$n" HIY
                       "已横过刀身，将刀锋正对着$N" HIY "，双手分握\n刀背和"
                       "刀把，缓缓向$N" HIY "推进。$N" HIY "见状不禁哑然失"
                       "笑，心道：“这也\n称得上是刀法？如此缓慢怎么破敌。"
                       "”当下也不多言，冲上前攻出\n一招，可霎时只见$n" HIY
                       "刀势一变，中攻直进向$N" HIY "劈来，竟然全无破\n绽。"
                       "$N" HIY "急忙左闪右避，可$n" HIY "的刀尖始终不离$N"
                       HIY "胸前半寸。\n" NOR, me, this_object());

        command("haha");
        command("say 这招乃是以慢制快的刀势，后发制人便是要点。");
        command("say 当年我从苗人凤处知晓了这个奥妙，终生收益不浅。");
        tell_object(me, HIC "你学会了「推天献印势」。\n" NOR);

        if (me->can_improve_skill("blade"))
                me->improve_skill("blade", 1500000);
        if (me->can_improve_skill("hujia-daofa"))
                me->improve_skill("hujia-daofa", 1500000);
        me->improve_skill("martial-cognize", 1500000);
        me->set("can_perform/hujia-daofa/xian", 1);
        me->add("gongxian", -900);
        return 1;
}

mixed ask_skill10()
{
        object me;

        me = this_player();

        if (me->query("can_perform/hujia-daofa/zhui"))
                return "俺不是已经教过你了吗？还多说什么？";

        if (me->query("family/family_name") != query("family/family_name"))
                return "你又不是俺胡家的，还和我罗嗦什么？";

        if (me->query_skill("hujia-daofa", 1) < 1)
                return "你连胡家刀法都未曾学过，哪里来绝招？";

        if (me->query("gongxian") < 1300)
                return "你在我胡家碌碌无为，这招我先不忙传你。";

        if (me->query("shen") < 22000)
                return "你侠义正事做得不够，这招我先不忙传你。";

        if (me->query_skill("force") < 200)
                return "你的内功火候不足，学不成这招。";

        if (me->query_skill("hujia-daofa", 1) < 140)
                return "你的胡家刀法火候未到，还得多练习练习。";

        message_vision(HIY "$n" HIY "微微颔首，更不答话，当即伸出右掌"
                       "，以掌作刀，先使出胡家\n刀法中的一式「霸王卸甲"
                       "」，掌锋斜斜划出一道半圈，至下往上劈\n出。待掌"
                       "至中途却猛然变成一招「穿心锥」，单掌急速旋转，"
                       "复由\n上往中穿出。$N" HIY "看到这里，双目陡然"
                       "一亮，似乎明白了什么。\n" NOR,
                       me, this_object());

        command("nod2");
        command("say 这招的精要便是先卸除敌人的防御，再给他致命一击。");
        command("say …嗯…这势太过凌厉，可千万不能用它为非作歹！");
        tell_object(me, HIC "你学会了「卸甲锥心势」。\n" NOR);

        if (me->can_improve_skill("blade"))
                me->improve_skill("blade", 1500000);
        if (me->can_improve_skill("hujia-daofa"))
                me->improve_skill("hujia-daofa", 1500000);
        me->improve_skill("martial-cognize", 1500000);
        me->set("can_perform/hujia-daofa/zhui", 1);
        me->add("gongxian", -1300);
        return 1;
}

mixed ask_skill11()
{
        object me;

        me = this_player();

        if (me->query("can_perform/hujia-daofa/cang"))
                return "俺不是已经教过你了吗？还多说什么？";

        if (me->query("family/family_name") != query("family/family_name"))
                return "你又不是俺胡家的，还和我罗嗦什么？";

        if (me->query_skill("hujia-daofa", 1) < 1)
                return "你连胡家刀法都未曾学过，哪里来绝招？";

        if (me->query("gongxian") < 2200)
                return "你在我胡家碌碌无为，这招我先不忙传你。";

        if (me->query("shen") < 30000)
                return "你侠义正事做得不够，这招我先不忙传你。";

        if (me->query_skill("force") < 250)
                return "你的内功火候不足，学不成这招。";

        if (me->query_skill("hujia-daofa", 1) < 180)
                return "你的胡家刀法火候未到，还得多练习练习。";

        message_vision(HIY "$n" HIY "凝视了$N" HIY "半天，缓缓地点了"
                       "点头，颇为赞许道：“想不到今日\n你的刀法能有"
                       "如此造诣，假以时日，你必当超过为师。今日我就"
                       "传\n你这套八方藏刀势，希望日后你能够有所作为"
                       "。”$n" HIY "顿了顿，又\n接着对$N" HIY "说道"
                       "：“我胡家刀法之所以厉害，不外乎刀势凌厉。须"
                       "知\n以主欺客，不如以客犯主；嫩胜于老，迟胜于"
                       "急。胡家刀法常用到\n的缠、滑、绞、擦、抽、截"
                       "等刀势就远强于一般刀法中展、抹、钩、\n剁、砍"
                       "、劈等刀势。而这八方藏刀势的变化却又不止于此"
                       "，让我慢\n慢给你说来……”如此这般，过了良久"
                       "……良久……\n" NOR, me, this_object());

        command("nod");
        command("say 刚才我所说的全是要点，需牢记在心。");
        command("say 你下来后一定要勤加练习，才能将这势用得纯熟。");
        tell_object(me, HIC "你学会了「八方藏刀势」。\n" NOR);

        if (me->can_improve_skill("force"))
                me->improve_skill("force", 1500000);
        if (me->can_improve_skill("dodge"))
                me->improve_skill("dodge", 1500000);
        if (me->can_improve_skill("parry"))
                me->improve_skill("parry", 1500000);
        if (me->can_improve_skill("blade"))
                me->improve_skill("blade", 1500000);
        if (me->can_improve_skill("hujia-daofa"))
                me->improve_skill("hujia-daofa", 1500000);
        me->improve_skill("martial-cognize", 1500000);
        me->set("can_perform/hujia-daofa/cang", 1);
        me->add("gongxian", -2200);
        return 1;
}

mixed ask_baodao()
{
        object me;
        object ob;
        object owner;

        me = this_player();

        if (me->query("family/family_name") != "关外胡家")
                return "你是哪里来的？跑来跟我罗嗦什么！";

        if (me->query("family/master_id") != query("id"))
                return "你又不是我的弟子，跟我罗嗦些什么？";

        if (me->query("shen") < 10000)
                return "你不是我侠义中人，这宝刀我不能给你。";

        if (me->query_skill("hujia-daofa", 1) < 150)
                return "你还是先在我这里把胡家刀法练好再说吧。";

        ob = find_object(LENGYUE);
        if (! ob) ob = load_object(LENGYUE);
        owner = environment(ob);
        while (owner)
        {
                if (owner->is_character() || ! environment(owner))
                        break;
                owner = environment(owner);
        }

        if (owner == me)
                return "奶奶的，你这个浑人！俺的宝刀不是交给你了吗？";

        if (objectp(owner) && owner != this_object())
        {
                if (! owner->is_character())
                        return "…嗯…冷月宝刀现在不在我手里。";

                if (owner->query("family/family_name") == "关外胡家")
                        return "冷月宝刀现在暂时是你兄弟" + owner->query("name") +
                               "在用，你要用就去找他吧。";
                else
                        return "俺的冷月宝刀现在落在了" + owner->query("name") +
                               "手中，你去把它找回来吧！";
        }
        ob->move(this_object());

        ob = new("/clone/weapon/gangdao");
        ob->move(this_object());
        ob->wield();

        message_vision(CYN "$N" CYN "大笑数声，道：好，我这柄宝刀你就拿去用吧。\n" NOR,
                       this_object(), me);
        command("give lengyue baodao to " + me->query("id"));
        return 1;
}

mixed ask_jundao()
{
        object me;
        object ob;
        object owner;

        me = this_player();

        if (me->query("family/family_name") != "关外胡家")
                return "你是哪里来的？跑来跟我罗嗦什么！";

        if (me->query("family/master_id") != query("id"))
                return "你又不是我的弟子，跟我罗嗦些什么？";

        if (me->query("shen") < 10000)
                return "你不是我侠义中人，这军刀我不能给你。";

        if (me->query_skill("blade", 1) < 120)
                return "你连刀都不会使，怎么配用闯王军刀？";

        ob = find_object(JUNDAO);
        if (! ob) ob = load_object(JUNDAO);
        owner = environment(ob);
        while (owner)
        {
                if (owner->is_character() || ! environment(owner))
                        break;
                owner = environment(owner);
        }

        if (owner == me)
                return "俺的那柄闯王军刀不就是你拿着在用吗？";

        if (objectp(owner) && owner != this_object())
        {
                if (! owner->is_character())
                        return "…嗯…闯王军刀现在不在我手里。";

                if (owner->query("family/family_name") == "关外胡家")
                        return "闯王军刀现在暂时是你兄弟" + owner->query("name") +
                               "在用，你要用就去找他吧。";
                else
                        return "俺的闯王军刀现在落在了" + owner->query("name") +
                               "手中，你去把它找回来吧！";
        }
        ob->move(this_object());

        ob = new("/clone/weapon/gangdao");
        ob->move(this_object());
        ob->wield();

        message_vision(CYN "$N" CYN "点了点头，沉声道：你小子有出息，闯王军"
                       "刀你就拿去用吧。\n" NOR, this_object(), me);
        command("give chuangwang jundao to " + me->query("id"));
        return 1;
}

mixed ask_quanjing()
{
        object me;
        object ob;
        object owner;

        me = this_player();

        if (me->query("family/family_name") != "关外胡家")
                return "你是哪里来的？跑来跟我罗嗦什么！";

        if (me->query("family/master_id") != query("id"))
                return "你又不是我的弟子，跟我罗嗦些什么？";

        if (me->query("shen") < 10000)
                return "你不是我侠义中人，这拳经我不能给你。";

        if (me->query("combat_exp") < 10000)
                return "你现在经验太浅，不用忙着去阅读拳经。";

        if (me->query_skill("hujia-quan", 1) > 119)
                return "你胡家拳法的造诣已经不浅了，那本拳经还是留给后辈们读吧。";

        ob = find_object(QUANJING);
        if (! ob) ob = load_object(QUANJING);
        owner = environment(ob);
        while (owner)
        {
                if (owner->is_character() || ! environment(owner))
                        break;
                owner = environment(owner);
        }

        if (owner == me)
                return "我胡家的家传拳经不就是你拿着在看吗？";

        if (objectp(owner) && owner != this_object())
        {
                if (! owner->is_character())
                        return "…嗯…胡家拳经现在不在我手里。";

                if (owner->query("family/family_name") == "关外胡家")
                        return "胡家拳经现在暂时被你兄弟" + owner->query("name") +
                               "取去看了，你要看就去找他吧。";
                else
                        return "我们胡家的家传拳经现在落在了" + owner->query("name") +
                               "手中，你去把它夺回来吧！";
        }
        ob->move(this_object());
        message_vision(CYN "$N" CYN "点头道：…嗯…这本拳经你就拿去吧，可要认真研读。\n" NOR,
                       this_object(), me);
        command("give hujia quanjing to " + me->query("id"));
        return 1;
}

mixed ask_daopu()
{
        object me;
        object ob;
        object owner;

        me = this_player();

        if (me->query("family/family_name") != "关外胡家")
                return "你是哪里来的？跑来跟我罗嗦什么！";

        if (me->query("family/master_id") != query("id"))
                return "你又不是我的弟子，跟我罗嗦些什么？";

        if (me->query("shen") < 15000)
                return "你不是我侠义中人，这刀谱我不能给你。";

        if (me->query("combat_exp") < 50000)
                return "你现在经验太浅，这本刀谱对你来说过于深奥了。";

        if (me->query_skill("blade", 1) > 179)
                return "你刀法的造诣已称得上是登峰造极了，刀谱还是留给后辈们读吧。";

        ob = find_object(DAOPU);
        if (! ob) ob = load_object(DAOPU);
        owner = environment(ob);
        while (owner)
        {
                if (owner->is_character() || ! environment(owner))
                        break;
                owner = environment(owner);
        }

        if (owner == me)
                return "我胡家的家刀谱经不就是你拿着在看吗？";

        if (objectp(owner) && owner != this_object())
        {
                if (! owner->is_character())
                        return "…嗯…胡家刀谱现在不在我手里。";

                if (owner->query("family/family_name") == "关外胡家")
                        return "胡家刀谱现在暂时被你兄弟" + owner->query("name") +
                               "取去看了，你要看就去找他吧。";
                else
                        return "我们胡家的家传刀谱现在落在了" + owner->query("name") +
                               "手中，你去把它夺回来吧！";
        }
        ob->move(this_object());
        message_vision(CYN "$N" CYN "点头道：这本胡家刀谱你就拿去看吧，有不懂"
                       "之处可以来问我。\n" NOR, this_object(), me);
        command("give hujia daopu to " + me->query("id"));
        return 1;
}

void unconcious()
{
        die();
}
