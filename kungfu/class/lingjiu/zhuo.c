#include <ansi.h>
#include "etc.h"

inherit NPC;
inherit F_MASTER;
inherit F_QUESTER;

mixed ask_me();

void create()
{
        set_name("卓不凡", ({ "zhuo bufan", "zhuo", "bufan"}));
        set("gender", "男性");
        set("title", "一字慧剑门门主");
        set("nickname", HIY "剑神" NOR);
        set("age", 37);
        set("long", @LONG
三十三年前，一字慧剑门满门师徒给童姥杀得
精光，当时卓不凡不在福建，幸免于难，从此
再也不敢回去，逃到长白山中荒僻极寒之地苦
研剑法，无意中得了前辈高手遗下来的一部剑
经，勤练剑法三十余年，终于剑术大成，自信
天下无敌。
LONG );
        set("attitude", "peaceful");
        set("str", 30);
        set("int", 30);
        set("con", 30);
        set("dex", 30);

        set("qi", 4500);
        set("max_qi", 4500);
        set("jing", 2200);
        set("max_jing", 2200);
        set("neili", 4800);
        set("max_neili", 4800);
        set("jiali", 150);
        set("combat_exp", 2200000);

        set_skill("force", 220);
        set_skill("zixia-shengong", 220);
        set_skill("sword", 240);
        set_skill("zhougong-jian", 240);
        set_skill("dodge", 220);
        set_skill("feiyan-zoubi", 220);
        set_skill("strike", 180);
        set_skill("liuyang-zhang", 180);
        set_skill("parry", 220);
        set_skill("martial-cognize", 220);
        set_skill("literate", 180);

        map_skill("force", "zixia-shengong");
        map_skill("sword", "zhougong-jian");
        map_skill("dodge", "feiyan-zoubi");
        map_skill("parry", "zhougong-jian");
        map_skill("strike", "liuyang-zhang");

        prepare_skill("strike", "liuyang-zhang");

        set("inquiry", ([
                "剑芒"     : (: ask_me :),
                "周公剑"   : "此乃天下第一剑法。",
                "剑神"     : "论空手，自然是我主公虚竹子第一。但若是论剑法嘛，还得是我。",
                "天山童姥" : "她杀尽我一字慧剑门满门师徒，幸亏她死得早！",
                "虚竹"     : "他是我们灵鹫宫新的主公，我们全部听他号令。",
                "虚竹子"   : "他是我们灵鹫宫新的主公，我们全部听他号令。",
                "剑法"     : "我的周公剑天下无双，除了主公，没第二人能够敌过。",
        ]));

        create_family("一字慧剑门", 3, "门主");

        set("chat_chance_combat", 120);
        set("chat_msg_combat", ({
                (: perform_action, "sword.mang" :),
                (: exert_function, "recover" :),
                (: exert_function, "powerup" :),
        }) );

        setup();
        carry_object("/clone/weapon/changjian")->wield();
        carry_object("/clone/cloth/cloth")->wear();
}

int recognize_apprentice(object ob, string skill)
{
        if (ob->query("family/family_name") != "灵鹫宫")
        {
                command("killair");
                command("say 你是什么东西，竟想习我精妙的剑法！");
                return -1;
        }

        if (ob->query("family/master_id") != "xuzhu zi")
        {
                command("hmm");
                command("say 恐怕这灵鹫宫里，还轮不到你说话。");
                return -1;

        }

        if (skill != "zhougong-jian" && skill != "sword")
        {
                command("hmm");
                command("say 其它武功我不传授。");
                return -1;
        }

        if (skill == "sword" && ob->query_skill("sword", 1) > 179)
        {
                command("hmm");
                command("say 够了，剩下的剑法自己去研究。");
                return -1;
        }

        if (! ob->query_temp("can_learn/zhuobufan"))
        {
                command("nod2");
                command("say 既然你感兴趣，又是主公的弟子，我就教你这套周公剑。");
                ob->set_temp("can_learn/zhuobufan", 1);
        }
        return 1;
}

mixed ask_me()
{
        object me;

        me = this_player();
        if (me->query("can_perform/zhougong-jian/mang"))
                return "我已经说得够多了，别跟我纠缠不休。";

        if (me->query("family/family_name") != "灵鹫宫" &&
           me->query("family/family_name") != "一字慧剑门")
                return "哼！不知阁下这话是什么意思？";

        if (me->query_skill("zhougong-jian", 1) < 1)
                return "你周公剑都未曾练过，还谈什么绝招。";

        if (me->query("family/family_name") == "灵鹫宫" &&
           me->query("gongxian") < 1000)
                return "主公有令，不得传功给无功劳的弟子。";

        if (me->query_skill("force") < 200)
                return "你的内功练成这样，还练什么剑法！";

        if ((int)me->query("max_neili", 1) < 2200)
                return "你的内力弱成这样，还练什么剑法！";

        if (me->query_skill("zhougong-jian", 1) < 140)
                return "你的周公剑火候还差得远，再回去练练！";

        message_vision(HIY "$n" HIY "更不答话，拔出腰间佩剑，长剑一"
                       "挺，剑尖上突然生\n出半尺吞吐不定的青芒。当真"
                       "气势如虹，一展王者风范。$N" HIY "\n的目光顿"
                       "时一亮，似乎明白了什么。\n" NOR, me,
                       this_object());
        command("hmm");
        command("say 看清楚了？");
        tell_object(me, HIC "你学会了「剑芒」。\n" NOR);
        if (me->can_improve_skill("sword"))
                me->improve_skill("sword", 1500000);
        if (me->can_improve_skill("zhougong-jian"))
                me->improve_skill("zhougong-jian", 1500000);
        me->improve_skill("martial-cognize", 1500000);
        me->set("can_perform/zhougong-jian/mang", 1);
        if (me->query("family/family_name") == "灵鹫宫")
                me->add("gongxian", -1000);
        return 1;
}

void attempt_apprentice(object ob)
{
        if (! permit_recruit(ob))
                return;

        command("smile");
        command("say 甚好！甚好！");
        command("say 我一字慧剑门门下无徒，今日老夫便收下你。");
        command("recruit " + ob->query("id"));
}

void unconcious()
{
        die();
}
