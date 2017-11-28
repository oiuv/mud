#include <ansi.h>
#include "miao.h"

#define TENGLONG  "/clone/lonely/tenglongjian"
#define JIANPUA   "/clone/lonely/book/miaojia1"
#define JIANPUB   "/clone/lonely/book/miaojia2"

inherit NPC;
inherit F_MASTER;
inherit F_COAGENT;
inherit F_QUESTER;

mixed ask_jian();
mixed ask_jianpu1();
mixed ask_jianpu2();

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

mixed  try_to_learn_miaojiajian();
mixed  try_to_learn_tianlongjian();
mixed  try_to_learn_chongtianzhang();

void create()
{
        object ob;
        set_name("苗人凤", ({ "miao renfeng", "miao", "renfeng" }));
        set("gender", "男性");
        set("nickname", YEL "金面佛" NOR);
        set("title", "打遍天下无敌手");
        set("age", 48);
        set("long", @LONG
他就是号称打遍天下无敌手的「金面佛」苗人
凤。只见他脸色透黄，似乎蒙上了一层淡淡的
金纸。他身材高大魁梧，四肢修长，却是全然
不修篇幅，令人称奇。
LONG );
        set("attitude", "friendly");
        set("shen_type", 1);
        set("str", 32);
        set("int", 31);
        set("con", 33);
        set("dex", 31);

        set("qi", 5500);
        set("max_qi", 5500);
        set("jing", 4000);
        set("max_jing", 4000);
        set("neili", 6800);
        set("max_neili", 6800);
        set("jiali", 200);
        set("combat_exp", 4500000);
        set("score", 20000);

        set_skill("force", 260);
        set_skill("miaojia-neigong", 260);
        set_skill("dodge", 240);
        set_skill("chaoyang-fengwu", 240);
        set_skill("sword", 260);
        set_skill("suqin-beijian", 260);
        set_skill("baxian-jian", 260);
        set_skill("tianlong-jian", 260);
        set_skill("miaojia-jian", 260);
        set_skill("blade", 240);
        set_skill("hujia-daofa", 240);
        set_skill("strike", 260);
        set_skill("miaojia-zhang", 260);
        set_skill("chongtian-zhang", 260);
        set_skill("claw", 260);
        set_skill("panlong-zhao", 260);
        set_skill("da-qinna", 240);
        set_skill("xiao-qinna", 240);
        set_skill("unarmed", 240);
        set_skill("pobei-tui", 240);
        set_skill("parry", 260);
        set_skill("literate", 240);
        set_skill("martial-cognize", 260);

        map_skill("force", "miaojia-neigong");
        map_skill("dodge", "chaoyang-fengwu");
        map_skill("sword", "miaojia-jian");
        map_skill("blade", "hujia-daofa");
        map_skill("parry", "tianlong-jian");
        map_skill("strike", "chongtian-zhang");
        map_skill("claw", "panlong-zhao");
        map_skill("unarmed", "pobei-tui");

        prepare_skill("claw", "panlong-zhao");
        prepare_skill("strike", "chongtian-zhang");

        set("no_teach", ([
                "miaojia-jian"    : (: try_to_learn_miaojiajian :),
                "tianlong-jian"   : (: try_to_learn_tianlongjian :),
                "chongtian-zhang" : (: try_to_learn_chongtianzhang :),
                "hujia-daofa"     : "胡家刀法乃是我当年从胡世兄处习得，不便外传。",
        ]));

        create_family("中原苗家", 6, "传人");

        set("inquiry", ([
                "腾龙剑"   : (: ask_jian :),
                "剑谱上册" : (: ask_jianpu1 :),
                "上册"     : (: ask_jianpu1 :),
                "剑谱下册" : (: ask_jianpu2 :),
                "下册"     : (: ask_jianpu2 :),
                "丹阳劲"   : (: ask_skill1 :),
                "五岳为开" : (: ask_skill2 :),
                "翅展九州" : (: ask_skill3 :),
                "残阳劲"   : (: ask_skill4 :),
                "魁星点元" : (: ask_skill5 :),
                "毒龙双锥" : (: ask_skill6 :),
                "云边摘月" : (: ask_skill7 :),
                "黄龙吐珠" : (: ask_skill8 :),
                "剑舞千秋" : (: ask_skill9 :),
                "流星赶月" : (: ask_skill10 :),
                "云中探爪" : "这招太过狠毒，我早已不用，你若有兴趣可到我书房自行翻书参悟。",
                "苗家剑谱" : "你是问剑谱上册还是剑谱下册？",
                "胡家刀法" : "胡家刀法乃是我当年从胡世兄处习得，当真精妙无比。",
                "胡一刀"   : "当年我中了奸人毒计杀害了他，令我遗憾终生！",
        ]));

        set("chat_chance_combat", 120);
        set("chat_msg_combat", ({
	        (: perform_action, "sword.zhai" :),
	        (: perform_action, "sword.zhu" :),
	        (: perform_action, "sword.jian" :),
	        (: perform_action, "sword.gan" :),
	        (: perform_action, "strike.zhan" :),
	        (: perform_action, "claw.tan" :),
	        (: exert_function, "recover" :),
	        (: exert_function, "powerup" :),
        }));

        set_temp("apply/damage", 100);
        set_temp("apply/unarmed_damage", 100);
        set_temp("apply/armor", 200);

        setup();

        if (clonep())
        {
                ob = find_object(TENGLONG);
                if (! ob) ob = load_object(TENGLONG);
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

        carry_object("/clone/cloth/cloth")->wear();
}

void attempt_apprentice(object ob)
{
        if (! permit_recruit(ob))
                return;

        if (ob->name(1) == "苗人凤")
        {
                command("hmm");
                command("say 你怎么也取这个名字？");
                return;
        }

        if (ob->name(1) == "苗若兰")
        {
                command("hmm");
                command("say 你就不能换个别的名字？");
                return;
        }

        if (ob->name(1) == "苗鬼凤" || ob->name(1) == "苗人龙")
        {
                command("hmm");
                command("say 你安心要和我作对是不是？");
                return;
        }

        command("sigh");
        command("recruit " + ob->query("id"));
        command("say 我本已打算不收徒弟，让我田家与胡、苗、范三家的纷争得以平息。");
        command("say 可是这祖传三十七势苗家剑就在我处失传，未免太过不孝。");
        return;
}

mixed try_to_learn_miaojiajian()
{
        object ob = this_player();

        if (ob->query("can_learn/miao/miaojia-jian"))
                return 0;

        if (ob->query("combat_exp") > 400000)
        {
                command("say 既然今日你能达此地步，我就传你苗家剑法。");
                ob->set("can_learn/miao/miaojia-jian", 1);
                return 0;
        }

        return "你此时功力太浅，我还是先传授你些简单的剑法。";
}

mixed try_to_learn_tianlongjian()
{
        object ob = this_player();

        if (ob->query("can_learn/miao/tianlong-jian"))
                return 0;

        if (ob->query("combat_exp") > 120000)
        {
                command("say 不错，不错。今日为师就传你天龙剑法。");
                ob->set("can_learn/miao/tianlong-jian", 1);
                return 0;
        }

        return "天龙剑法对你来说过于深奥，还是先打好基础再说吧。";
}

mixed try_to_learn_chongtianzhang()
{
        object ob = this_player();

        if (ob->query("can_learn/miao/chongtian-zhang"))
                return 0;

        if (ob->query("combat_exp") > 100000)
        {
                command("say 看来你武功已经有了一定的基础，今日我就传你白鹤冲天掌。");
                ob->set("can_learn/miao/chongtian-zhang", 1);
                return 0;
        }

        return "这套白鹤冲天掌过于繁杂，我还是先教你些简单的武功吧。";
}

mixed ask_skill1()
{
        object me;

        me = this_player();

        if (me->query("can_perform/miaojia-zhang/dan"))
                return "自己下去练！还多说什么？";

        if (me->query("family/family_name") != query("family/family_name"))
                return "给我走开！";

        if (me->query_skill("miaojia-zhang", 1) < 1)
                return "你连苗家掌法都未学，何谈绝招可言？";

        if (me->query("gongxian") < 50)
                return "你在我苗家无所作为，这招我先不忙传你。";

        if (me->query("shen") < 2000)
                return "你侠义正事做得不够，这招我先不忙传你。";

        if (me->query_skill("force") < 50)
                return "你的内功火候不足，学不成这招。";

        if (me->query("max_neili") < 200)
                return "你的内力修为不足，学不成这招。";

        if (me->query_skill("miaojia-zhang", 1) < 40)
                return "你的苗家掌法火候未到，还得多练习练习。";

        message_vision(HIY "$n" HIY "微微点了点头，伸手将$N" HIY "招至身"
                       "边，在耳旁低声细\n说良久，$N" HIY "听后会心的一笑"
                       "，看来大有所悟。\n" NOR, me, this_object());

        command("nod");
        command("say 刚才我说的都需牢记在心。");
        tell_object(me, HIC "你学会了「丹阳劲」。\n" NOR);

        if (me->can_improve_skill("strike"))
                me->improve_skill("strike", 1500000);
        if (me->can_improve_skill("miaojia-zhang"))
                me->improve_skill("miaojia-zhang", 1500000);
        me->improve_skill("martial-cognize", 1500000);
        me->set("can_perform/miaojia-zhang/dan", 1);
        me->add("gongxian", -50);
        return 1;
}

mixed ask_skill2()
{
        object me;

        me = this_player();

        if (me->query("can_perform/pobei-tui/kai"))
                return "自己下去练！还多说什么？";

        if (me->query("family/family_name") != query("family/family_name"))
                return "给我走开！";

        if (me->query_skill("pobei-tui", 1) < 1)
                return "你连破碑腿都未学，何谈绝招可言？";

        if (me->query("gongxian") < 200)
                return "你在我苗家无所作为，这招我先不忙传你。";

        if (me->query("shen") < 8000)
                return "你侠义正事做得不够，这招我先不忙传你。";

        if (me->query_skill("force") < 150)
                return "你的内功火候不足，学不成这招。";

        if (me->query("max_neili") < 1000)
                return "你的内力修为不足，学不成这招。";

        if (me->query_skill("pobei-tui", 1) < 100)
                return "你的破碑腿火候未到，还得多练习练习。";

        message_vision(HIY "$n" HIY "哼了一声，沉声道：“五岳为开倒也"
                       "不见得，只是\n祖辈们过于抬高它的威力罢了。”随"
                       "即起身而立，左腿连\n变数中方位，“砰”的一声陡"
                       "然踢出，顿时将$N" HIY "面前的那\n张木几踢得粉"
                       "碎。\n" NOR, me, this_object());

        command("heng");
        command("say 威力仅此而已，称作五岳为开实在是太过狂妄。");
        command("say 你自己下去练习吧。");
        tell_object(me, HIC "你学会了「五岳为开」。\n" NOR);

        if (me->can_improve_skill("unarmed"))
                me->improve_skill("unarmed", 1500000);
        if (me->can_improve_skill("pobei-tui"))
                me->improve_skill("pobei-tui", 1500000);
        me->improve_skill("martial-cognize", 1500000);
        me->set("can_perform/pobei-tui/kai", 1);
        me->add("gongxian", -200);
        return 1;
}

mixed ask_skill3()
{
        object me;

        me = this_player();

        if (me->query("can_perform/chongtian-zhang/zhan"))
                return "自己下去练！还多说什么？";

        if (me->query("family/family_name") != query("family/family_name"))
                return "给我走开！";

        if (me->query_skill("chongtian-zhang", 1) < 1)
                return "你连白鹤冲天掌都未学，何谈绝招可言？";

        if (me->query("gongxian") < 350)
                return "你在我苗家无所作为，这招我先不忙传你。";

        if (me->query("shen") < 12000)
                return "你侠义正事做得不够，这招我先不忙传你。";

        if (me->query_skill("force") < 150)
                return "你的内功火候不足，学不成这招。";

        if (me->query("max_neili") < 1500)
                return "你的内力修为不足，学不成这招。";

        if (me->query_skill("chongtian-zhang", 1) < 120)
                return "你的白鹤冲天掌火候未到，还得多练习练习。";

        message_vision(HIY "$n" HIY "点了点头，随即拉开架势，双臂舒张，掌"
                       "缘微微颤\n动。身形一展，已移至$N" HIY "跟前，双掌"
                       "交叉奋力劈下，正是\n白鹤冲天掌「翅展九州」绝技，空"
                       "气中顿时爆响出一阵尖\n锐的破空声。\n" NOR, me,
                       this_object());

        command("nod");
        command("say 看明白了？");
        tell_object(me, HIC "你学会了「翅展九州」。\n" NOR);

        if (me->can_improve_skill("strike"))
                me->improve_skill("strike", 1500000);
        if (me->can_improve_skill("chongtian-zhang"))
                me->improve_skill("chongtian-zhang", 1500000);
        me->improve_skill("martial-cognize", 1500000);
        me->set("can_perform/chongtian-zhang/zhan", 1);
        me->add("gongxian", -350);
        return 1;
}

mixed ask_skill4()
{
        object me;

        me = this_player();

        if (me->query("can_perform/suqin-beijian/can"))
                return "自己下去练！还多说什么？";

        if (me->query("family/family_name") != query("family/family_name"))
                return "给我走开！";

        if (me->query_skill("suqin-beijian", 1) < 1)
                return "你连苏秦背剑都未学，何谈绝招可言？";

        if (me->query("gongxian") < 50)
                return "你在我苗家无所作为，这招我先不忙传你。";

        if (me->query("shen") < 3000)
                return "你侠义正事做得不够，这招我先不忙传你。";

        if (me->query_skill("force") < 80)
                return "你的内功火候不足，学不成这招。";

        if (me->query("max_neili") < 1000)
                return "你的内力修为不足，学不成这招。";

        if (me->query_skill("suqin-beijian", 1) < 60)
                return "你的苏秦背剑火候未到，还得多练习练习。";

        message_vision(HIY "$n" HIY "点了点头，从怀中轻轻取出了一本剑"
                       "谱，指着其中\n的一段对$N" HIY "解释了半天，$N"
                       HIY "一边听一边点头。\n" NOR, me, this_object());

        command("nod");
        command("say 你自己下去练习吧。");
        tell_object(me, HIC "你学会了「残阳劲」。\n" NOR);

        if (me->can_improve_skill("sword"))
                me->improve_skill("sword", 1500000);
        if (me->can_improve_skill("suqin-beijian"))
                me->improve_skill("suqin-beijian", 1500000);
        me->improve_skill("martial-cognize", 1500000);
        me->set("can_perform/suqin-beijian/can", 1);
        me->add("gongxian", -50);
        return 1;
}

mixed ask_skill5()
{
        object me;

        me = this_player();

        if (me->query("can_perform/baxian-jian/dian"))
                return "自己下去练！还多说什么？";

        if (me->query("family/family_name") != query("family/family_name"))
                return "给我走开！";

        if (me->query_skill("baxian-jian", 1) < 1)
                return "你连八仙剑法都未学，何谈绝招可言？";

        if (me->query("gongxian") < 300)
                return "你在我苗家无所作为，这招我先不忙传你。";

        if (me->query("shen") < 10000)
                return "你侠义正事做得不够，这招我先不忙传你。";

        if (me->query_skill("force") < 150)
                return "你的内功火候不足，学不成这招。";

        if (me->query("max_neili") < 1000)
                return "你的内力修为不足，学不成这招。";

        if (me->query_skill("baxian-jian", 1) < 100)
                return "你的八仙剑法火候未到，还得多练习练习。";

        message_vision(HIY "$n" HIY "叹了口气，转身出手一指点在$N" HIY
                       "胸口之上，$N" HIY "登时\n全身一麻，如遭电击，"
                       "只感内力源源而泻，竟似不受自己\n控制一般，不禁"
                       "大惊失色。\n" NOR, me, this_object());

        command("nod");
        command("say 你懂了么？");
        tell_object(me, HIC "你学会了「魁星点元」。\n" NOR);

        if (me->can_improve_skill("sword"))
                me->improve_skill("sword", 1500000);
        if (me->can_improve_skill("baxian-jian"))
                me->improve_skill("baxian-jian", 1500000);
        me->improve_skill("martial-cognize", 1500000);
        me->set("can_perform/baxian-jian/dian", 1);
        me->add("gongxian", -300);
        return 1;
}

mixed ask_skill6()
{
        object me;

        me = this_player();

        if (me->query("can_perform/tianlong-jian/zhui"))
                return "自己下去练！还多说什么？";

        if (me->query("family/family_name") != query("family/family_name"))
                return "给我走开！";

        if (me->query_skill("tianlong-jian", 1) < 1)
                return "你连天龙剑法都未学，何谈绝招可言？";

        if (me->query("gongxian") < 800)
                return "你在我苗家无所作为，这招我先不忙传你。";

        if (me->query("shen") < 15000)
                return "你侠义正事做得不够，这招我先不忙传你。";

        if (me->query_skill("force") < 150)
                return "你的内功火候不足，学不成这招。";

        if (me->query("max_neili") < 1500)
                return "你的内力修为不足，学不成这招。";

        if (me->query_skill("tianlong-jian", 1) < 120)
                return "你的天龙剑法火候未到，还得多练习练习。";

        message_vision(HIY "$n" HIY "对$N" HIY "点了点头，说道：“瞧仔"
                       "细了！”说完便听得\n$n" HIY "一声清啸，拔出腰间"
                       "配剑急速旋转，剑尖作锥，剑\n身顿时腾起一股旋风"
                       "，迅雷般攻出一剑。随即$n" HIY "抽剑\n回转，撩下"
                       "劈上，剑尖一颤，顿时激荡出一股凛冽的旋涡\n钻劲"
                       "，又攻出了第二剑。\n" NOR, me, this_object());

        command("nod");
        command("say 这招太过狠毒，平时不可轻易使用。");
        tell_object(me, HIC "你学会了「毒龙双锥」。\n" NOR);

        if (me->can_improve_skill("sword"))
                me->improve_skill("sword", 1500000);
        if (me->can_improve_skill("tianlong-jian"))
                me->improve_skill("tianlong-jian", 1500000);
        me->improve_skill("martial-cognize", 1500000);
        me->set("can_perform/tianlong-jian/zhui", 1);
        me->add("gongxian", -800);
        return 1;
}

mixed ask_skill7()
{
        object me;

        me = this_player();

        if (me->query("can_perform/miaojia-jian/zhai"))
                return "自己下去练！还多说什么？";

        if (me->query("family/family_name") != query("family/family_name"))
                return "给我走开！";

        if (me->query_skill("miaojia-jian", 1) < 1)
                return "你连苗家剑法都未学，何谈绝招可言？";

        if (me->query("gongxian") < 400)
                return "你在我苗家无所作为，这招我先不忙传你。";

        if (me->query("shen") < 13000)
                return "你侠义正事做得不够，这招我先不忙传你。";

        if (me->query_skill("force") < 120)
                return "你的内功火候不足，学不成这招。";

        if (me->query("max_neili") < 800)
                return "你的内力修为不足，学不成这招。";

        if (me->query_skill("miaojia-jian", 1) < 100)
                return "你的苗家剑法火候未到，还得多练习练习。";

        message_vision(HIY "$n" HIY "对$N" HIY "点了点头，随手从桌上"
                       "拈起一根筷子，慢慢的\n演示剑招。$N" HIY "只见"
                       "$n" HIY "剑势舒张，吞吐不定，瞬时之间\n已连换"
                       "数种剑势，剑法之巧妙，当真前所未闻。\n" NOR,
                       me, this_object());

        command("nod");
        command("say 此招看似复杂，其实并不难练，你下去后自己体会吧。");
        tell_object(me, HIC "你学会了「云边摘月」。\n" NOR);

        if (me->can_improve_skill("sword"))
                me->improve_skill("sword", 1500000);
        if (me->can_improve_skill("miaojia-jian"))
                me->improve_skill("miaojia-jian", 1500000);
        me->improve_skill("martial-cognize", 1500000);
        me->set("can_perform/miaojia-jian/zhai", 1);
        me->add("gongxian", -400);
        return 1;
}

mixed ask_skill8()
{
        object me;

        me = this_player();

        if (me->query("can_perform/miaojia-jian/zhu"))
                return "自己下去练！还多说什么？";

        if (me->query("family/family_name") != query("family/family_name"))
                return "给我走开！";

        if (me->query_skill("miaojia-jian", 1) < 1)
                return "你连苗家剑法都未学，何谈绝招可言？";

        if (me->query("gongxian") < 600)
                return "你在我苗家无所作为，这招我先不忙传你。";

        if (me->query("shen") < 15000)
                return "你侠义正事做得不够，这招我先不忙传你。";

        if (me->query_skill("force") < 150)
                return "你的内功火候不足，学不成这招。";

        if (me->query("max_neili") < 1200)
                return "你的内力修为不足，学不成这招。";

        if (me->query_skill("miaojia-jian", 1) < 120)
                return "你的苗家剑法火候未到，还得多练习练习。";

        message_vision(HIY "$n" HIY "对$N" HIY "笑了笑，随即伸出右手，"
                       "中食二指并拢，捏作\n剑诀，“嗤”的一声空点而出"
                       "，霎时破空之声骤响，一股\n气劲从指尖迸发，将$N"
                       HIY "身旁的木几穿透出一个小孔。\n" NOR, me,
                       this_object());

        command("nod");
        command("say 此招不外乎是以剑作媒，以气伤人。");
        tell_object(me, HIC "你学会了「黄龙吐珠」。\n" NOR);

        if (me->can_improve_skill("sword"))
                me->improve_skill("sword", 1500000);
        if (me->can_improve_skill("miaojia-jian"))
                me->improve_skill("miaojia-jian", 1500000);
        me->improve_skill("martial-cognize", 1500000);
        me->set("can_perform/miaojia-jian/zhu", 1);
        me->add("gongxian", -600);
        return 1;
}

mixed ask_skill9()
{
        object me;

        me = this_player();

        if (me->query("can_perform/miaojia-jian/qian"))
                return "自己下去练！还多说什么？";

        if (me->query("family/family_name") != query("family/family_name"))
                return "给我走开！";

        if (me->query_skill("miaojia-jian", 1) < 1)
                return "你连苗家剑法都未学，何谈绝招可言？";

        if (me->query("gongxian") < 1000)
                return "你在我苗家无所作为，这招我先不忙传你。";

        if (me->query("shen") < 18000)
                return "你侠义正事做得不够，这招我先不忙传你。";

        if (me->query_skill("force") < 220)
                return "你的内功火候不足，学不成这招。";

        if (me->query("max_neili") < 1800)
                return "你的内力修为不足，学不成这招。";

        if (me->query_skill("miaojia-jian", 1) < 160)
                return "你的苗家剑法火候未到，还得多练习练习。";

        message_vision(HIY "$n" HIY "长叹一声，当下也不答话，从$N" HIY
                       "处接过配剑，将三\n十七势苗家剑连环施出，霎时剑"
                       "光逼人，气芒纵横，龙吟\n不止。只见$n" HIY "所"
                       "施的三十七势剑法竟如一势，交替连\n环，一气呵成"
                       "，并无任何破绽，$N" HIY "只看得目瞪口呆。\n"
                       NOR, me, this_object());

        command("nod");
        command("say 你自己下去练习吧。");
        tell_object(me, HIC "你学会了「剑舞千秋」。\n" NOR);

        if (me->can_improve_skill("sword"))
                me->improve_skill("sword", 1500000);
        if (me->can_improve_skill("miaojia-jian"))
                me->improve_skill("miaojia-jian", 1500000);
        me->improve_skill("martial-cognize", 1500000);
        me->set("can_perform/miaojia-jian/qian", 1);
        me->add("gongxian", -1000);
        return 1;
}

mixed ask_skill10()
{
        object me;

        me = this_player();

        if (me->query("can_perform/miaojia-jian/gan"))
                return "自己下去练！还多说什么？";

        if (me->query("family/family_name") != query("family/family_name"))
                return "给我走开！";

        if (me->query_skill("miaojia-jian", 1) < 1)
                return "你连苗家剑法都未学，何谈绝招可言？";

        if (me->query("gongxian") < 2200)
                return "你在我苗家无所作为，这招我先不忙传你。";

        if (me->query("shen") < 35000)
                return "你侠义正事做得不够，这招我先不忙传你。";

        if (me->query_skill("force") < 280)
                return "你的内功火候不足，学不成这招。";

        if (me->query("max_neili") < 3000)
                return "你的内力修为不足，学不成这招。";

        if (me->query_skill("miaojia-jian", 1) < 200)
                return "你的苗家剑法火候未到，还得多练习练习。";

        message_vision(HIY "$n" HIY "凝视了$N" HIY "半天，缓缓地点了"
                       "点头。当下拔出腰间配\n剑，剑走龙蛇，白光如虹"
                       "，凝重处如山岳巍峙，轻灵处若\n清风无迹，神剑"
                       "之威，当真神鬼难测。舞到急处，$n" HIY "\n一声"
                       "大喝，手中配剑竟然离手射出，化作一道流星，直"
                       "没\n至柄插入$N" HIY "对面的墙壁中。\n" NOR,
                       me, this_object());

        command("nod");
        command("say 这招是我苗家剑法的精髓，可要勤加练习。");
        tell_object(me, HIC "你学会了「流星赶月」。\n" NOR);

        if (me->can_improve_skill("force"))
                me->improve_skill("force", 1500000);
        if (me->can_improve_skill("parry"))
                me->improve_skill("parry", 1500000);
        if (me->can_improve_skill("sword"))
                me->improve_skill("sword", 1500000);
        if (me->can_improve_skill("miaojia-jian"))
                me->improve_skill("miaojia-jian", 1500000);
        me->improve_skill("martial-cognize", 1500000);
        me->set("can_perform/miaojia-jian/gan", 1);
        me->add("gongxian", -2200);
        return 1;
}

mixed ask_jian()
{
        object me;
        object ob;
        object owner;

        me = this_player();

        if (me->query("family/family_name") != "中原苗家")
                return "给我走开！";

        if (me->query("family/master_id") != query("id"))
                return "你又不是我的弟子，跟我罗嗦些什么？";

        if (me->query("shen") < 20000)
                return "你非我侠义中人，这腾龙剑我不能给你。";

        if (me->query_skill("sword", 1) < 150)
                return "你剑法都没练好，就算利剑在手又有何用？";

        ob = find_object(TENGLONG);
        if (! ob) ob = load_object(TENGLONG);
        owner = environment(ob);
        while (owner)
        {
                if (owner->is_character() || ! environment(owner))
                        break;
                owner = environment(owner);
        }

        if (owner == me)
                return "腾龙剑现在不就是你拿着在用吗？";

        if (objectp(owner) && owner != this_object())
        {
                if (! owner->is_character())
                        return "腾龙剑现在不在我这里。";

                if (owner->query("family/family_name") == "中原苗家")
                        return "腾龙剑现在暂时是你兄弟" + owner->query("name") +
                               "在用，你要用就去找他吧。";
                else
                        return "我的腾龙剑现在落在了" + owner->query("name") +
                               "手中，你去把它找回来吧！";
        }
        ob->move(this_object());

        ob = new("/clone/weapon/changjian");
        ob->move(this_object());
        ob->wield();

        message_vision(CYN "$N" CYN "点了点头，沉声道：这腾龙剑你拿去吧，切莫用它为非作歹。\n" NOR,
                       this_object(), me);
        command("give tenglong jian to " + me->query("id"));
        return 1;
}

mixed ask_jianpu1()
{
        object me;
        object ob;
        object owner;

        me = this_player();

        if (me->query("family/family_name") != "中原苗家")
                return "给我走开！";

        if (me->query("family/master_id") != query("id"))
                return "你又不是我的弟子，跟我罗嗦些什么？";

        if (me->query("shen") < 15000)
                return "你不是我侠义中人，这剑谱我不能给你。";

        if (me->query("combat_exp") < 10000)
                return "你现在经验太浅，这本剑谱对你来说过于深奥了。";

        if (me->query_skill("suqin-beijian", 1) > 119)
                return "你的剑法根基已经很扎实了，这剑谱还是留给后辈们吧。";

        ob = find_object(JIANPUA);
        if (! ob) ob = load_object(JIANPUA);
        owner = environment(ob);
        while (owner)
        {
                if (owner->is_character() || ! environment(owner))
                        break;
                owner = environment(owner);
        }

        if (owner == me)
                return "我苗家的家传剑谱不就是你拿着在看吗？";

        if (objectp(owner) && owner != this_object())
        {
                if (! owner->is_character())
                        return "…嗯…剑谱现在不在我手里。";

                if (owner->query("family/family_name") == "中原苗家")
                        return "苗家剑谱现在暂时被你兄弟" + owner->query("name") +
                               "取去看了，你要看就去找他吧。";
                else
                        return "我们苗家的家传剑谱现在落在了" + owner->query("name") +
                               "手中，你去把它夺回来吧！";
        }
        ob->move(this_object());
        message_vision(CYN "$N" CYN "点头道：这本剑谱你就拿去看吧，可要仔细阅读。\n" NOR,
                       this_object(), me);
        command("give miaojia jianpu to " + me->query("id"));
        return 1;
}

mixed ask_jianpu2()
{
        object me;
        object ob;
        object owner;

        me = this_player();

        if (me->query("family/family_name") != "中原苗家")
                return "给我走开！";

        if (me->query("family/master_id") != query("id"))
                return "你又不是我的弟子，跟我罗嗦些什么？";

        if (me->query("shen") < 50000)
                return "你不是我侠义中人，这剑谱我不能给你。";

        if (me->query("combat_exp") < 300000)
                return "你现在经验太浅，这本剑谱对你来说过于深奥了。";

        if (me->query_skill("sword", 1) > 199)
                return "你的剑法造诣已算得上是登峰造极了，这剑谱还是留给后辈们吧。";

        ob = find_object(JIANPUB);
        if (! ob) ob = load_object(JIANPUB);
        owner = environment(ob);
        while (owner)
        {
                if (owner->is_character() || ! environment(owner))
                        break;
                owner = environment(owner);
        }

        if (owner == me)
                return "我苗家的家传剑谱不就是你拿着在看吗？";

        if (objectp(owner) && owner != this_object())
        {
                if (! owner->is_character())
                        return "…嗯…剑谱现在不在我手里。";

                if (owner->query("family/family_name") == "中原苗家")
                        return "苗家剑谱现在暂时被你兄弟" + owner->query("name") +
                               "取去看了，你要看就去找他吧。";
                else
                        return "我们苗家的家传剑谱现在落在了" + owner->query("name") +
                               "手中，你去把它夺回来吧！";
        }
        ob->move(this_object());
        message_vision(CYN "$N" CYN "凝视了$N" CYN "良久，沉声道：今日我将这剑谱交给你，可别"
                       "落入奸人之手。\n" NOR, this_object(), me);
        command("give miaojia jianpu to " + me->query("id"));
        return 1;
}

void unconcious()
{
        die();
}
