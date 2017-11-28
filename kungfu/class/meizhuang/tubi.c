#include <ansi.h>
#include "meizhuang.h"

inherit NPC;
inherit F_MASTER;

mixed ask_skill1();
mixed ask_skill2();

void create()
{
        set_name("秃笔翁", ({ "tubi weng", "tubi", "tu", "bi", "weng" }));
        set("long", @LONG
他就是梅庄四位庄主排行第三的秃笔翁。只见
他身穿一件干干净净的白色长袍。他已年愈五
旬，身材矮小，顶上光光，一看就知道是个极
易动怒的人。
LONG);
        set("title", "梅庄三庄主");
        set("nickname", HIR "梅庄四友" NOR);
        set("gender", "男性");
        set("attitude", "friendly");
        set("age", 52);
        set("str", 25);
        set("int", 25);
        set("con", 25);
        set("dex", 25);
        set("max_qi", 4500);
        set("max_jing", 4000);
        set("neili", 5000);
        set("max_neili", 5000);
        set("jiali", 150);
        set("combat_exp", 2000000);

        set_skill("force", 220);
        set_skill("wuzheng-xinfa", 200);
        set_skill("xuantian-wujigong", 220);
        set_skill("dodge", 200);
        set_skill("meihua-zhuang", 200);
        set_skill("dagger", 220);
        set_skill("shigu-bifa", 220);
        set_skill("parry", 200);
        set_skill("strike", 200);
        set_skill("qingmang-zhang", 200);
        set_skill("calligraphy", 300);
        set_skill("literate", 300);
        set_skill("martial-cognize", 200);

        map_skill("force", "xuantian-wujigong");
        map_skill("dodge", "meihua-zhuang");
        map_skill("parry", "shigu-bifa");
        map_skill("dagger", "shigu-bifa");
        map_skill("strike", "qingmang-zhang");

        prepare_skill("strike", "qingmang-zhang");

        create_family("梅庄", 1, "庄主");

        set("inquiry", ([
                "绝招"        : "你要问什么绝招？",
                "绝技"        : "你要问什么绝技？",
                "任我行"      : "任我行乃日月神教上代教主，不过已经失踪很久了。",
                "东方不败"    : "东方教主武功深不可测，天下无敌。",
                "日月神教"    : "我们梅庄四友和日月神教已无瓜葛，你提它作甚？",
                "率意帖"      : "唐朝张旭的《率意帖》乃书中一绝，不过我却无缘一见。",
                "神笔封穴"    : (: ask_skill1 :),
                "诗意纵横"    : (: ask_skill2 :),
        ]));

        set("chat_chance_combat", 100);
        set("chat_msg_combat", ({
                (: perform_action, "dagger.feng" :),
                (: perform_action, "dagger.shiyi" :),
                (: exert_function, "recover" :),
                (: exert_function, "powerup" :),
        }) );

        setup();
        carry_object("/d/city/npc/obj/cloth")->wear();
        carry_object("/d/meizhuang/obj/panguanbi")->wield();
}

void attempt_apprentice(object me)
{
        if (! permit_recruit(me))
                return;

        if ( me->query("family/family_name") &&
             me->query("family/family_name") == "日月神教" &&
             me->query("family/master_name") == "东方不败" )
        {
                command("yi");
                command("say 我道是谁，原来是东方教主的弟子。");
                command("say 这件事我不便插手，你去找我大哥、二哥好了。");
                me->set("move_party/日月神教—梅庄", 1);
                return;
        }

        if ((int)me->query("combat_exp") < 50000)
        {
                command("sigh");
                command("say 你的江湖经验太浅，还是先多锻炼锻炼再说吧。");
                return;
        }

        if ((int)me->query_skill("wuzheng-xinfa", 1) < 80
           && (int)me->query_skill("xuantian-wujigong", 1) < 80)
        {
                command("say 你连本门的内功都没学好，我收你做甚？");
                return;
        }

        command("say 好吧，既然你有心练武，我就收下你。");
        command("recruit " + me->query("id"));
}

mixed ask_skill1()
{
        object me;

        me = this_player();

        if (me->query("can_perform/shigu-bifa/feng"))
                return "我已经教过你了，自己下去练，别老是跟我纠缠不休。";

        if (me->query("family/family_name") != query("family/family_name"))
                return RANK_D->query_respect(me) + "和本教素无瓜葛，何出此言？";

        if (me->query_skill("shigu-bifa", 1) < 1)
                return "你连石鼓打穴笔法都没学，何谈此言？";

        if (me->query("gongxian") < 300)
                return "你对本庄所作出的贡献不够，这一招我暂时还不能传你。";

        if (me->query_skill("calligraphy", 1) < 100)
                return "嘿，你连字都写不好，还谈什么笔法？";

        if (me->query_skill("shigu-bifa", 1) < 100)
                return "你的石鼓打穴笔法还练得不到家，自己下去练练再来吧！";

        if (me->query_skill("force") < 150)
                return "你的内功火候尚不精纯，学不了，学不了。";

        message_vision(HIY "$n" HIY "哈哈一笑，说道：不错，不错，孺子可"
                       "教也。今天我就传你这招。\n$n" HIY "说完便将$N"
                       HIY "招至身前，嘀嘀咕咕说了半天。\n" NOR, me,
                       this_object());
        command("nod");
        command("say 刚才我所说的便是这神笔封穴的精要，懂了就下去练吧。");
        tell_object(me, HIC "你学会了「神笔封穴」。\n" NOR);

        if (me->can_improve_skill("dagger"))
                me->improve_skill("dagger", 1500000);
        if (me->can_improve_skill("shigu-bifa"))
                me->improve_skill("shigu-bifa", 1500000);
        me->improve_skill("martial-cognize", 1500000);
        me->set("can_perform/shigu-bifa/feng", 1);
        me->add("gongxian", -300);

        return 1;
}

mixed ask_skill2()
{
        object me;

        me = this_player();

        if (me->query("can_perform/shigu-bifa/shiyi"))
                return "我已经教过你了，自己下去练，别老是跟我纠缠不休。";

        if (me->query("family/family_name") != query("family/family_name"))
                return RANK_D->query_respect(me) + "和本教素无瓜葛，何出此言？";

        if (me->query_skill("shigu-bifa", 1) < 1)
                return "你连石鼓打穴笔法都没学，何谈此言？";

        if (me->query("gongxian") < 300)
                return "你对本庄所作出的贡献不够，这一招我暂时还不能传你。";

        if (me->query_skill("calligraphy", 1) < 100)
                return "嘿，你连字都写不好，还谈什么笔法？";

        if (me->query_skill("shigu-bifa", 1) < 100)
                return "你的石鼓打穴笔法还练得不到家，自己下去练练再来吧！";

        if (me->query_skill("force") < 150)
                return "你的内功火候尚不精纯，学不了，学不了。";

        message_vision(HIY "$n" HIY "点了点头，说道：这一套笔法乃是从颜真"
                       "卿所书诗帖中变化出来\n的，一共二十三字，每字三招至"
                       "十六招不等，你可听好了。只听$n" HIY "\n摇头晃脑的"
                       "念道：裴将军！大君制六合，猛将清九垓。战马若龙虎，"
                       "腾\n陵何壮哉……\n" NOR, me, this_object());
        command("nod " + me->query("id"));
        command("say 刚才我说的都记住了吗？自己下去练吧。");
        tell_object(me, HIC "你学会了「诗意纵横」。\n" NOR);

        if (me->can_improve_skill("dagger"))
                me->improve_skill("dagger", 1500000);
        if (me->can_improve_skill("shigu-bifa"))
                me->improve_skill("shigu-bifa", 1500000);
        me->improve_skill("martial-cognize", 1500000);
        me->set("can_perform/shigu-bifa/shiyi", 1);
        me->add("gongxian", -300);

        return 1;
}