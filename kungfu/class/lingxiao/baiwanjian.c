#include <ansi.h>
#include "lingxiao.h"

inherit NPC;
inherit F_MASTER;
inherit F_QUESTER;
inherit F_COAGENT;

mixed ask_skill1();
mixed ask_skill2();
mixed ask_skill3();
mixed ask_skill4();
mixed ask_skill5();
mixed ask_skill6();

void create()
{
        set_name("白万剑", ({"bai wanjian", "bai", "wanjian"}));
        set("nickname", HIW "气寒西北" NOR);
        set("long", "白万剑是雪山派掌门人威德先生白自在的长子，他\n"
                    "们师兄弟均以“万”字排行，他名字居然叫到白万\n"
                    "剑，足见剑法之高。\n");
        set("gender", "男性");
        set("age", 34);
        set("attitude", "friendly");
        set("shen_type", 1);
        set("str", 30);
        set("int", 30);
        set("con", 30);
        set("dex", 30);
        set("max_qi", 3800);
        set("max_jing", 3000);
        set("neili", 4500);
        set("max_neili", 4500);
        set("jiali", 180);
        set("combat_exp", 1000000);

        set("inquiry",([
                "冷剑决"   : (: ask_skill1 :),
                "凌霄总诀" : (: ask_skill2 :),
                "飞絮飘零" : (: ask_skill3 :),
                "鹤冲九霄" : (: ask_skill4 :),
                "风回雪舞" : (: ask_skill5 :),
                "雪花六出" : (: ask_skill6 :),
        ]));

        set_skill("force", 200);
        set_skill("xueshan-neigong", 200);
        set_skill("dodge", 200);
        set_skill("taxue-wuhen", 200);
        set_skill("cuff", 180);
        set_skill("lingxiao-quan", 180);
        set_skill("strike", 180);
        set_skill("piaoxu-zhang", 180);
        set_skill("sword", 220);
        set_skill("hanmei-jian", 220);
        set_skill("yunhe-jian", 220);
        set_skill("xueshan-jian", 220);
        set_skill("parry", 200);
        set_skill("literate", 200);
        set_skill("martial-cognize", 150);

        map_skill("force", "xueshan-neigong");
        map_skill("dodge", "taxue-wuhen");
        map_skill("cuff", "lingxiao-quan");
        map_skill("strike", "piaoxu-zhang");
        map_skill("sword", "xueshan-jian");
        map_skill("parry", "yunhe-jian");

        prepare_skill("strike", "piaoxu-zhang");
        prepare_skill("cuff", "lingxiao-quan");

        create_family("凌霄城", 6, "掌门弟子");

        set("chat_chance_combat", 120);
        set("chat_msg_combat", ({
                (: perform_action, "sword.hui" :),
                (: perform_action, "sword.chu" :),
                (: perform_action, "cuff.jue" :),
                (: perform_action, "strike.piao" :),
                (: exert_function, "recover" :),
                (: exert_function, "powerup" :),
        }));

        setup();
        
        carry_object("/clone/weapon/changjian")->wield();
        carry_object("/clone/cloth/cloth")->wear();
}

void attempt_apprentice(object me)
{
        if (! permit_recruit(me))
                return;

        if ((int)me->query("shen") < 3000)
        {
                command("say 学武须先正身，试问德行这一项，你做得够吗？");
                return;
        }

        if ((int)me->query("combat_exp") < 150000)
        {
                command("say 你现在江湖经验太浅，还是多锻炼锻炼再来吧。");
                return;
        }

        if ((int)me->query_skill("xueshan-neigong", 1) < 80)
        {
                command("say 你本门的内功心法太差，修炼好了之后再来找我。");
                return;
        }

        if ((int)me->query_skill("sword", 1) < 80)
        {
                command("say 你的剑法根基实在是太差，下去多练练再来。");
                return;
        }

        command("say 很好，很好。");
        command("say 念在你有心，今日我便收你为徒，希望日后能有一翻作为。");
        command("recruit " + me->query("id"));
}

mixed ask_skill1()
{
        object me;

        me = this_player();
        if (me->query("can_perform/hanmei-jian/leng"))
                return "自己下去练，别在这里跟我罗嗦个没完！";

        if (me->query("family/family_name") != query("family/family_name"))
                return "阁下从何而来，这样打听我雪山派绝招是什么意思？";

        if (me->query_skill("hanmei-jian", 1) < 1)
                return "你连寒梅剑法都没学，还谈什么绝招可言？";

        if (me->query("gongxian") < 50)
                return "哼，你在本派中无所作为，这一招我暂时还不能传你。";

        if (me->query_skill("force") < 50)
                return "你的内功修行实在太差，下去练练再来！";

        if (me->query_skill("hanmei-jian", 1) < 40)
                return "亏你寒梅剑法练成这样，也好意思来找我。";

        message_vision(HIY "$n" HIY "略微点了点头，将$N" HIY "招至"
                        "跟前。轻声在$N" HIY "耳畔细说\n良久，时不"
                        "时还伸手演化剑招，$N" HIY "一边听一边点头"
                        "。\n" NOR, me, this_object());
        command("nod");
        command("say 这招很简单，你下去照我说的练习便成。");
        tell_object(me, HIC "你学会了「冷剑决」。\n" NOR);

        if (me->can_improve_skill("sword"))
                me->improve_skill("sword", 1500000);
        if (me->can_improve_skill("hanmei-jian"))
                me->improve_skill("hanmei-jian", 1500000);
        me->improve_skill("martial-cognize", 1500000);
        me->set("can_perform/hanmei-jian/leng", 1);
        me->add("gongxian", -50);
        return 1;
}

mixed ask_skill2()
{
        object me;

        me = this_player();
        if (me->query("can_perform/lingxiao-quan/jue"))
                return "自己下去练，别老跟我纠缠不休！";

        if (me->query("family/family_name") != query("family/family_name"))
                return "阁下无故打听我雪山派的绝招是什么意思？";

        if (me->query_skill("lingxiao-quan", 1) < 1)
                return "你连凌霄拳法都没学，还谈什么绝招可言？";

        if (me->query("gongxian") < 100)
                return "哼，你在本派中无所作为，这一招我暂时还不能传你。";

        if (me->query_skill("force") < 100)
                return "你的内功修行实在太差，下去练练再来！";

        if (me->query_skill("lingxiao-quan", 1) < 60)
                return "亏你凌霄拳法练成这样，也好意思来找我。";

        message_vision(HIY "$n" HIY "打量了$N" HIY "一翻，然后微微一"
                       "笑，示以赞许。又将$N" HIY "\n招至跟前，轻声在"
                       "$N" HIY "耳畔细说良久，时不时还伸手比出几\n式"
                       "拳法中的精妙之处，$N" HIY "一边听一边点头。\n"
                       NOR, me, this_object());
        command("nod");
        command("say 这招并不难，只需切记‘御力而发’四字即可。");
        tell_object(me, HIC "你学会了「凌宵总诀」。\n" NOR);

        if (me->can_improve_skill("cuff"))
                me->improve_skill("cuff", 1500000);
        if (me->can_improve_skill("lingxiao-quan"))
                me->improve_skill("lingxiao-quan", 1500000);
        me->improve_skill("martial-cognize", 1500000);
        me->set("can_perform/lingxiao-quan/jue", 1);
        me->add("gongxian", -100);
        return 1;
}

mixed ask_skill3()
{
        object me;

        me = this_player();
        if (me->query("can_perform/piaoxu-zhang/piao"))
                return "自己下去练，别在这里跟我罗嗦个没完！";

        if (me->query("family/family_name") != query("family/family_name"))
                return "阁下无故打听我雪山派的绝招是什么意思？";

        if (me->query_skill("piaoxu-zhang", 1) < 1)
                return "你连飘絮掌法都没学，还谈什么绝招可言？";

        if (me->query("gongxian") < 150)
                return "哼，你在本派中无所作为，这一招我暂时还不能传你。";

        if (me->query_skill("force") < 100)
                return "你的内功修行实在太差，下去练练再来！";

        if (me->query_skill("piaoxu-zhang", 1) < 80)
                return "亏你飘絮掌法练成这样，也好意思来找我。";

        message_vision(HIY "$n" HIY "略微点了点头，说道：“我给你演示"
                      "一遍，可得瞧\n仔细了！”随即一声清啸，双掌纷飞"
                      "贯出，掌影重重叠叠\n虚实难辨，全全笼罩$N" HIY
                      "全身。\n" NOR, me, this_object());
        command("nod");
        command("say 刚才我所演示的全是这招的精华，你下去照着练就行了。");
        tell_object(me, HIC "你学会了「飞絮飘零」。\n" NOR);

        if (me->can_improve_skill("strike"))
                me->improve_skill("strike", 1500000);
        if (me->can_improve_skill("piaoxu-zhang"))
                me->improve_skill("piaoxu-zhang", 1500000);
        me->improve_skill("martial-cognize", 1500000);
        me->set("can_perform/piaoxu-zhang/piao", 1);
        me->add("gongxian", -150);
        return 1;
}

mixed ask_skill4()
{
        object me;

        me = this_player();
        if (me->query("can_perform/yunhe-jian/chong"))
                return "自己下去练，别老跟我纠缠不休！";

        if (me->query("family/family_name") != query("family/family_name"))
                return "阁下这样打听我雪山派绝招是什么意思？";

        if (me->query_skill("yunhe-jian", 1) < 1)
                return "你连云鹤七剑都没学，还谈什么绝招可言？";

        if (me->query("gongxian") < 200)
                return "哼，你在本派中无所作为，这一招我暂时还不能传你。";

        if (me->query_skill("force") < 150)
                return "你的内功修行实在太差，下去练练再来！";

        if (me->query_skill("yunhe-jian", 1) < 100)
                return "亏你云鹤七剑练成这样，也好意思来找我。";

        message_vision(HIY "$n" HIY "点了点头，随手从身后的书架上取"
                       "出一本剑经，指\n着其中一段对$N" HIY "细说了"
                       "良久，$N" HIY "一边听一边点头。\n" NOR, me,
                       this_object());
        command("nod");
        command("say 这招很简单，你下去照我说的练习便成。");
        tell_object(me, HIC "你学会了「鹤冲九霄」。\n" NOR);

        if (me->can_improve_skill("sword"))
                me->improve_skill("sword", 1500000);
        if (me->can_improve_skill("yunhe-jian"))
                me->improve_skill("yunhe-jian", 1500000);
        me->improve_skill("martial-cognize", 1500000);
        me->set("can_perform/yunhe-jian/chong", 1);
        me->add("gongxian", -200);
        return 1;
}

mixed ask_skill5()
{
        object me;

        me = this_player();
        if (me->query("can_perform/xueshan-jian/hui"))
                return "这招我不是已经教过你了吗？自己下去多练吧！";

        if (me->query("family/family_name") != query("family/family_name"))
                return "你是哪里来的？快给我快快滚开！";

        if (me->query_skill("xueshan-jian", 1) < 1)
                return "你连雪山剑法都没学，还谈什么绝招可言？";

        if (me->query("gongxian") < 500)
                return "哼，你在本派中无所作为，这一招我暂时还不能传你。";

        if (me->query_skill("force") < 100)
                return "你的内功修行太浅，用不了这一招！";

        if (me->query_skill("xueshan-jian", 1) < 30)
                return "你雪山剑法尚未修炼得精深，没法用这招。";

        message_vision(HIY "$n" HIY "微微一笑，点了点头。说着便在$N" HIY
                        "耳边轻声述说剑\n诀精要，一边说还一边比划着些什"
                       "么。过了良久，只见$N" HIY "\n会心的一笑，似乎有"
                       "了什么新的感悟。\n" NOR, me, this_object());
        command("smile");
        command("say 这一招看似复杂，实却简洁，稍加练习便成。");
        tell_object(me, HIC "你学会了「风回雪舞」。\n" NOR);

        if (me->can_improve_skill("sword"))
                me->improve_skill("sword", 1500000);
        if (me->can_improve_skill("xueshan-jian"))
                me->improve_skill("xueshan-jian", 1500000);
        me->improve_skill("martial-cognize", 1500000);
        me->set("can_perform/xueshan-jian/hui", 1);
        me->add("gongxian", -500);
        return 1;
}

mixed ask_skill6()
{
        object me;

        me = this_player();
        if (me->query("can_perform/xueshan-jian/chu"))
                return "这招我不是已经教过你了吗？自己下去多练吧！";

        if (me->query("family/family_name") != query("family/family_name"))
                return "你是哪里来的？快给我快快滚开！";

        if (me->query_skill("xueshan-jian", 1) < 1)
                return "你连雪山剑法都没学，还谈什么绝招可言？";

        if (me->query("gongxian") < 1000)
                return "哼，你在本派中无所作为，这一招我暂时还不能传你。";

        if (me->query_skill("force") < 200)
                return "你的内功修行太浅，用不了这一招！";

        if (me->query_skill("xueshan-jian", 1) < 140)
                return "你雪山剑法尚未修炼得精深，没法用这招。";

        message_vision(HIY "$n" HIY "微微一笑，对$N" HIY "赞道：“想"
                       "不到今日你能有如此造\n诣，我这就传你这招。”"
                        "说完$n" HIY "拔出配剑，单手握住\n剑诀，顿时"
                       "只见长剑抖动，虚中有实，实中有虚，剑尖剑\n锋"
                        "齐用，凌厉刺出。$N" HIY "只觉眼前剑光一闪而"
                       "过，随即木屑\n纷飞，面前的红漆门柱上竟豁然印"
                       "出六道剑痕，便宛如盛\n开的梅花一般，精雕细琢"
                       "也不过如此。\n" NOR, me, this_object());
        command("haha");
        command("say 这一招便是雪花六出，你下去后需得勤加练习。");
        tell_object(me, HIC "你学会了「雪花六出」。\n" NOR);

        if (me->can_improve_skill("sword"))
                me->improve_skill("sword", 1500000);
        if (me->can_improve_skill("xueshan-jian"))
                me->improve_skill("xueshan-jian", 1500000);
        me->improve_skill("martial-cognize", 1500000);
        me->set("can_perform/xueshan-jian/chu", 1);
        me->add("gongxian", -1000);
        return 1;
}

void unconcious()
{
        die();
}
