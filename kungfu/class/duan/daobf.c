#include <ansi.h>
#include "duan.h"

inherit NPC;
inherit F_MASTER;

mixed ask_skill1();

void create()
{
        set_name("刀白凤", ({ "dao baifeng", "dao", "baifeng" }));
        set("title",  "大理国镇南王妃");
        set("nickname",  CYN "玉虚散人" NOR);
        set("gender", "女性");
        set("long", @LONG
这是个容貌秀丽的中年道姑，是个摆夷族女子，颇
有雍容气质。她本是大理国皇帝段正淳的正房原配
夫人。因恼丈夫风流不羁，沾花惹草，一怒之下跑
到这里出了家。
LONG );
        set("age", 35);
        set("class", "royal");
        set("attitude", "friendly");
        set("shen_type", 1);
        set("str", 25);
        set("int", 25);
        set("con", 25);
        set("dex", 25);
        
        set("max_qi", 2500);
        set("max_jing", 1200);
        set("neili", 3000);
        set("max_neili", 3000);
        set("jiali", 100);
        set("combat_exp", 800000);
        set("score", 8000);

        set_skill("force", 160);
        set_skill("duanshi-xinfa", 100);
        set_skill("kurong-changong", 160);
        set_skill("dodge", 160);
        set_skill("tiannan-bu", 160);
        set_skill("cuff", 140);
        set_skill("jinyu-quan", 140);
        set_skill("strike", 140);
        set_skill("wuluo-zhang", 140);
        set_skill("sword", 120);
        set_skill("duanjia-jian", 120);
        set_skill("whip", 160);
        set_skill("feifeng-bian", 160);
        set_skill("finger", 120);
        set_skill("qiantian-zhi", 120);
        set_skill("parry", 240);
        set_skill("buddhism", 200);
        set_skill("literate", 200);
        set_skill("martial-cognize", 140);

        map_skill("force", "kurong-changong");
        map_skill("dodge", "tiannan-bu");
        map_skill("finger", "qiantian-zhi");
        map_skill("cuff", "jinyu-quan");
        map_skill("strike", "wuluo-zhang");
        map_skill("whip", "feifeng-bian");
        map_skill("sword", "duanjia-jian");
        map_skill("parry", "feifeng-bian");

        prepare_skill("cuff", "jinyu-quan");
        prepare_skill("strike", "wuluo-zhang");

        set("inquiry", ([
                "凤栖于梧"   : (: ask_skill1 :),
        ]));

        create_family("段氏皇族", 15, "王妃");

        set("chat_chance_combat", 120);
        set("chat_msg_combat", ({
                (: perform_action, "whip.xi" :),
                (: perform_action, "cuff.man" :),
                (: perform_action, "strike.bian" :),
                (: exert_function, "recover" :),
        }));

        setup();
        carry_object("/d/dali/npc/obj/cynrobe")->wear();
        carry_object("/d/dali/obj/fuchen")->wield();
        add_money("silver", 10);
}

void attempt_apprentice(object ob)
{
        if (! permit_recruit(ob))
                return;

        command("sigh");
        command("say 我早已看破红尘，你又来烦我做甚？");

        if (ob->query("gender") == "女性")
	        command("say 待他日你功力深厚，我倒是可以传你一套鞭法。");

        return;
}

int recognize_apprentice(object ob, string skill)
{
        if (ob->query("family/family_name") != "段氏皇族")
        {
                command("?");
                command("say 我与阁下素不相识，不知阁下此番是何用意？");
                return -1;
        }

        if (ob->query("gender") != "女性")
        {
                command("sigh");
                command("say 我这点微末功夫算什么，你还是去跟你爹爹学吧。");
                return -1;
        }

        if (ob->query("combat_exp") < 30000)
        {
                command("say 你现在经验尚浅，过段时间再来找我吧。\n");
                return -1;
        }

        if (skill != "feifeng-bian" && skill != "whip")
        {
                command("say 我只传授你这套飞凤鞭法，其余的还是去找你爹爹学吧。");
                return -1;
        }

        if (! ob->query_temp("can_learn/daobaifeng"))
        {
                command("sigh");
                command("say 既然你还念念不忘娘亲，今日我就教你好了。");
                ob->set_temp("can_learn/daobaifeng", 1);
        }
        return 1;
}

mixed ask_skill1()
{
        object me;

        me = this_player();
        if (me->query("can_perform/feifeng-bian/xi"))
                return "我不是已经教给你了吗？还有什么不懂就自己研究。";

        if (me->query("family/family_name") != query("family/family_name"))
                return RANK_D->query_respect(me) + "和我素无瓜葛，何出此言？";

        if (me->query_skill("feifeng-bian", 1) < 1)
                return "你连我飞凤鞭法都未学，怎么来绝招一说？";

        if (me->query("shen") < 0)
                return "哼，你还嫌你在外面惹的祸事不够么？";

        if (me->query("gongxian") < 300)
                return "你在族里碌碌无为，叫我如何信得过你？";

        if (me->query_skill("force") < 150)
                return "你的内功修为太差，学不了这一招。";

        if ((int)me->query("max_neili", 1) < 1200)
                return "你的内力弱成这样，怎么学习这一招？";

        if (me->query_skill("feifeng-bian", 1) < 120)
                return "你飞凤鞭法的火候还不够，回去练练再来。";

        message_sort(HIY "\n$n" HIY "对$N" HIY "点了点头，随即取出腰"
                     "间拂尘，力贯梢柄，急速挥舞，拂尘顿时画出一个又"
                     "一个的圈子，紧逼$N" HIY "而去，招式变化甚为精巧"
                     "。\n\n" NOR, me, this_object()); 

        command("nod");
        command("say 这招看似花巧，其实并不难练，下去后仍需勤加练习。");
        tell_object(me, HIC "你学会了「凤栖于梧」。\n" NOR);
        if (me->can_improve_skill("whip"))
                me->improve_skill("whip", 1500000);
        if (me->can_improve_skill("feifeng-bian"))
                me->improve_skill("feifeng-bian", 1500000);
        me->improve_skill("martial-cognize", 1500000);
        me->set("can_perform/feifeng-bian/xi", 1);
        me->add("gongxian", -300);
        return 1;
}
