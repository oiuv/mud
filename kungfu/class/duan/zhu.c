#include <ansi.h>
#include "duan.h"

inherit NPC;
inherit F_MASTER;

mixed ask_skill1();

void create()
{
        set_name("朱丹臣", ({ "zhu danchen", "zhu", "danchen" }));
        set("title", "大理国护卫" );
        set("nickname", CYN "笔砚生" NOR);
        set("long", "他是大理国四大护卫之一。一副书生酸溜溜的打扮行头。\n");
        set("gender", "男性");
        set("age", 40);
        set("class", "officer");
        set("attitude", "friendly");
        set("shen_type", 1);
        set("str", 30);
        set("int", 20);
        set("con", 25);
        set("dex", 25);
        
        set("max_qi", 1800);
        set("max_jing", 1000);
        set("neili", 2200);
        set("max_neili", 2200);
        set("jiali", 50);
        set("combat_exp", 500000);
        set("score", 5000);

        set_skill("force", 120);
        set_skill("duanshi-xinfa", 120);
        set_skill("dodge", 120);
        set_skill("tiannan-bu", 120);
        set_skill("cuff", 120);
        set_skill("jinyu-quan", 120);
        set_skill("strike", 120);
        set_skill("wuluo-zhang", 120);
        set_skill("dagger", 140);
        set_skill("qingliang-daxuefa", 140);
        set_skill("parry", 120);
        set_skill("literate", 280);
        set_skill("martial-cognize", 140);

        map_skill("force", "duanshi-xinfa");
        map_skill("dodge", "tiannan-bu");
        map_skill("cuff", "jinyu-quan");
        map_skill("strike", "wuluo-zhang");
        map_skill("dagger", "qingliang-daxuefa");
        map_skill("parry", "qingliang-daxuefa");

        prepare_skill("cuff", "jinyu-quan");
        prepare_skill("strike", "wuluo-zhang");

        set("inquiry", ([
                "透骨钉"   : (: ask_skill1 :),
        ]));

        create_family("段氏皇族", 15, "家臣");

        set("chat_chance_combat", 120);
        set("chat_msg_combat", ({
                (: perform_action, "dagger.ding" :),
                (: perform_action, "cuff.man" :),
                (: perform_action, "strike.bian" :),
                (: exert_function, "recover" :),
        }));

        setup();
        carry_object("/d/dali/npc/obj/junfu")->wear();
        carry_object("/d/meizhuang/obj/panguanbi")->wield();
        add_money("silver", 10);
}

void attempt_apprentice(object ob)
{
        if (! permit_recruit(ob))
                return;

        command("smile");
        command("say 世子殿下何需如此，只要有事吩咐在下一声便是。");
        command("say 若世子不嫌弃，我这里倒是有一套笔法可以传授予你。");

        return;
}

int recognize_apprentice(object ob, string skill)
{
        if (ob->query("family/family_name") != "段氏皇族")
        {
                command("sneer");
                command("say 我与阁下素不相识，不知阁下此话从何说起？");
                return -1;
        }

        if (skill != "qingliang-daxuefa" && skill != "dagger")
        {
                command("say 朱某生平只对笔法一项有所研究，其它功夫所知甚浅。");
                return -1;
        }

        if (! ob->query_temp("can_learn/zhudanchen"))
        {
                command("hehe");
                command("say 既然世子有心习武，在下理当竭尽所能传授。");
                ob->set_temp("can_learn/zhudanchen", 1);
        }
        return 1;
}

mixed ask_skill1()
{
        object me;

        me = this_player();
        if (me->query("can_perform/qingliang-daxuefa/ding"))
                return "我不是已经教给你了吗？";

        if (me->query("family/family_name") != query("family/family_name"))
                return RANK_D->query_respect(me) + "和我素无瓜葛，何出此言？";

        if (me->query_skill("qingliang-daxuefa", 1) < 1)
                return "你连我清凉打穴法都未学，怎么来绝招一说？";

        if (me->query("gongxian") < 400)
                return "恕在下无礼，王爷吩咐过，不得传功给无功子弟。";

        if (me->query_skill("force") < 150)
                return "你的内功修为太差，学不了这一招。";

        if ((int)me->query("max_neili", 1) < 1200)
                return "你的内力修为太差，学不了这一招。";

        if (me->query_skill("qingliang-daxuefa", 1) < 100)
                return "你清凉打穴法的火候还不够，回去练练再来吧。";

        message_sort(HIY "\n$n" HIY "微微一笑，伸手将$N" HIY "招到身前，低"
                     "声在$N" HIY "耳旁嘀咕了半天。然后又拔出腰间铁扇翻转数"
                     "下，斜刺而出。似乎是一种颇为独特的打穴法。\n\n" NOR,
                     me, this_object());

        command("smile");
        command("say 这招并不难练，依世子的悟性很快就可以熟练运用了。");
        tell_object(me, HIC "你学会了「透骨钉」。\n" NOR);
        if (me->can_improve_skill("dagger"))
                me->improve_skill("dagger", 1500000);
        if (me->can_improve_skill("qingliang-daxuefa"))
                me->improve_skill("qingliang-daxuefa", 1500000);
        me->improve_skill("martial-cognize", 1500000);
        me->set("can_perform/qingliang-daxuefa/ding", 1);
        me->add("gongxian", -400);
        return 1;
}
