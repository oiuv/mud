#include <ansi.h>
inherit NPC;

void create()
{
        set_name("朱子柳", ({"zhu ziliu", "zhu", "ziliu"}));
        set("gender", "男性");
        set("age", 55);
        set("title", HIY "南帝四大弟子" NOR);
        set("long", @LONG
朱子柳乃是一灯大师的四大弟子之一，现在正协助
郭靖、黄蓉镇守襄阳城。
LONG );
        set("attitude", "peaceful");
        set("per", 17);
        set("str", 40);
        set("int", 20);
        set("con", 30);
        set("dex", 25);

        set("max_qi", 3200);
        set("max_jing", 2600);
        set("neili", 4200);
        set("max_neili", 4200);
        set("jiali", 150);
        set("combat_exp", 2500000);
        set("score", 5000);

        set_skill("force", 180);
        set_skill("duanshi-xinfa", 180);
        set_skill("dodge", 180);
        set_skill("tiannan-bu", 180);
        set_skill("cuff", 180);
        set_skill("jinyu-quan", 180);
        set_skill("strike", 180);
        set_skill("wuluo-zhang", 180);
        set_skill("dagger", 200);
        set_skill("qingliang-daxuefa", 200);
        set_skill("parry", 180);
        set_skill("literate", 400);
        set_skill("martial-cognize", 180);

        map_skill("force", "duanshi-xinfa");
        map_skill("dodge", "tiannan-bu");
        map_skill("cuff", "jinyu-quan");
        map_skill("strike", "wuluo-zhang");
        map_skill("dagger", "qingliang-daxuefa");
        map_skill("parry", "qingliang-daxuefa");

        prepare_skill("cuff", "jinyu-quan");
        prepare_skill("strike", "wuluo-zhang");

        create_family("段氏皇族", 6, "家臣");

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

void init()
{
        object ob;

        ::init();
        if (interactive(ob = this_player()) && ! is_fighting())
	{
                remove_call_out("greeting");
                call_out("greeting", 1, ob);
        }
}

int recognize_apprentice(object ob, string skill)
{
        if (ob->query("combat_exp") > 40000)
        {
                command("say 你经验也不低了，应该多出去锻炼，可别埋没在这里。");
                return -1;
        }

        if (skill != "literate")
        {
                command("shake");
                command("say 在这儿我最多传授你一些读书写字的常识。");
                command("say 其它的还是等你将来拜师后找师父学吧。");
                return -1;
        }

        if (skill == "literate" && ob->query_skill("literate", 1) > 99)
        {
                command("haha");
                command("say 你的文学造诣已经非常不错了，就到此为止吧。");
                return -1;
        }

        if (! ob->query_temp("can_learn/zhuziliu"))
        {
                command("smile");
                command("say 趁年轻多读点书是好事，我就教你点读书写字的常识吧。");
                ob->set_temp("can_learn/zhuziliu", 1);
        }
        return 1;
}

void greeting(object ob)
{
       if (! ob || environment(ob) != environment()) return;

       if (ob->query_skill("literate") > 99) return;

       command("pat " + ob->query("id"));
       command("say 这位" + RANK_D->query_respect(ob) + "，过来跟我学些知"
               "识(" HIY "xue zhu ziliu literate" NOR + CYN ")吧。" NOR);

}
