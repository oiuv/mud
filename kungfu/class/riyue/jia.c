#include <ansi.h>
#include "riyue.h"

inherit NPC;
inherit F_MASTER;

mixed ask_skill1();

void create()
{
	set_name("贾布", ({ "jia bu", "jia", "bu"}));
        set("title", "日月神教青龙堂长老");
        set("nickname", YEL "金面使者" NOR);
        set("long", @LONG
这是日月神教青龙堂长老贾布。只见他蜡黄瘦
脸，两边太阳穴高高鼓起，变如藏了一枚枚核
桃似的，表情甚是严肃。
LONG);
	set("gender", "男性" );
        set("class", "scholar");
        set("age", 39);
        set("attitude", "friendly");
        set("shen_type", -1);
        set("str", 36);
        set("int", 36);
        set("con", 36);
        set("dex", 36);
        
        set("max_qi", 4800);
        set("max_jing", 3500);
        set("neili", 5600);
        set("max_neili", 5600);
        set("jiali", 180);
        set("combat_exp", 2500000);
        set("score", 10000);

        set_skill("force", 220);
        set_skill("riyue-xinfa", 220);
        set_skill("tianhuan-shenjue", 220);
        set_skill("dodge", 240);
        set_skill("feiyan-zoubi", 240);
        set_skill("juechen-shenfa", 240);
        set_skill("dagger", 240);
        set_skill("jifeng-cixuefa", 240);
        set_skill("canghong-bifa", 240);
        set_skill("claw", 200);
        set_skill("da-qinna", 180);
        set_skill("xiao-qinna", 180);
        set_skill("strike", 200);
        set_skill("qingmang-zhang", 200);
        set_skill("parry", 240);
        set_skill("martial-cognize", 180);
        set_skill("literate", 220);

        map_skill("dodge", "juechen-shenfa");
        map_skill("force", "tianhuan-shenjue");
        map_skill("dagger", "canghong-bifa");
        map_skill("claw", "da-qinna");
        map_skill("parry", "canghong-bifa");
        map_skill("strike", "qingmang-zhang");

        prepare_skill("claw", "xiao-qinna");

        create_family("日月神教", 13, "青龙堂长老");

        set("inquiry", ([
                "惊虹一笔" : (: ask_skill1 :),
        ]));

	set("chat_chance_combat", 120);
	set("chat_msg_combat", ({
                (: perform_action, "dagger.jing" :),
		(: exert_function, "powerup" :),
		(: exert_function, "recover" :),
	}) );

        setup();

        carry_object("/d/heimuya/npc/obj/jinpao")->wear();
        carry_object("/d/meizhuang/obj/panguanbi")->wield();
}

void attempt_apprentice(object ob)
{
        if (! permit_recruit(ob))
                return;

        if ((int)ob->query("shen") > -25000)
        {
                command("hmm");
                command("say 我从来不和正派武林人士交往，你快滚吧！");
                return;
        }

        if (ob->query("combat_exp") < 200000)
        {
                command("say 你现在江湖经验太浅，还应该多走动走动。");
                return;
        }

        if (ob->query_skill("dagger", 1) < 80)
        {
                command("en");
                command("say 我所精研的乃是打穴法，这三十四路苍虹笔法天下无双。");
                command("say 你既然要做我的弟子，就应该在短兵刃上面多下功夫。");
                return;
        }

        if (ob->query_skill("tianhuan-shenjue", 1) < 80
           && ob->query_skill("riyue-xinfa", 1) < 80)
        {
                command("hmm");
                command("say 你连本门最基本的内功都没修好，怎么学习上乘武学。");
                return;
        }

        command("nod2");
        command("say 那你以后就跟着我好了。");
        command("say 教内事务繁多，切莫乱了规矩。");
        command("recruit " + ob->query("id"));
        return;
}

mixed ask_skill1()
{
        object me;

        me = this_player();

        if (me->query("can_perform/canghong-bifa/jing"))
                return "这一招我不是已经教过你了吗？";

        if (me->query("family/family_name") != query("family/family_name"))
                return "你又不是我日月神教的，跑来捣什么乱？";

        if (me->query_skill("canghong-bifa", 1) < 1)
                return "你连苍虹笔法都没学，还谈什么绝招可言？";

        if (me->query("gongxian") < 400)
                return "你在教内甚无作为，这招我暂时还不能传你。";

        if (me->query("shen") > -30000)
                return "你这样心慈手软，就算学会这招又有什么用？";

        if (me->query_skill("force") < 150)
                return "你的内功火候尚需提高，练好了再来找我吧。";

        if (me->query_skill("canghong-bifa", 1) < 100)
                return "你的苍虹笔法还练得不到家，自己下去练练再来吧！";

        message_sort(HIY "\n$n" HIY "哈哈一笑，说道：不错，不错，孺子可"
                     "教也。今天老夫就传你这招。$n" HIY "说完便将$N" HIY
                     "招至身前，嘀嘀咕咕说了半天。\n\n" NOR, me,
                     this_object());

        command("nod");
        command("say 刚才我所说的便是这笔法的精要，你听懂了多少？");
        tell_object(me, HIC "你学会了「惊虹一笔」。\n" NOR);
        if (me->can_improve_skill("dagger"))
                me->improve_skill("dagger", 1500000);
        if (me->can_improve_skill("canghong-bifa"))
                me->improve_skill("canghong-bifa", 1500000);
        me->improve_skill("martial-cognize", 1500000);
        me->set("can_perform/canghong-bifa/jing", 1);
        me->add("gongxian", -400);

        return 1;
}
