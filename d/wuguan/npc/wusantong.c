#include <ansi.h>
inherit NPC;

void create()
{
        set_name("武三通", ({"wu santong", "wu", "santong"}));
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
                (: perform_action, "cuff.man" :),
                (: perform_action, "strike.bian" :),
                (: exert_function, "recover" :),
        }));

        setup();
        carry_object("/d/dali/npc/obj/junfu")->wear();
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
                command("say 你现在应该多出去锻炼锻炼，呆在这里可不是办法。");
                return -1;
        }

        if (skill != "force"
           && skill != "dodge"
           && skill != "parry")
        {
                command("hmm");
                command("say 我最多传授你一些" HIY "内功" NOR + CYN "、" HIY
                        "轻功" NOR + CYN "和" HIY "招架" NOR + CYN "的基本常识。" NOR);
                command("say 其它的还是等你将来拜师后找师父学吧。");
                return -1;
        }

        if (skill == "force" && ob->query_skill("force", 1) > 99)
        {
                command("hehe");
                command("say 你内功方面的造诣已经相当不错了，就到此为止吧。");
                return -1;
        }

        if (skill == "parry" && ob->query_skill("parry", 1) > 99)
        {
                command("hehe");
                command("say 你招架方面的造诣已经相当不错了，就到此为止吧。");
                return -1;
        }

        if (skill == "dodge" && ob->query_skill("dodge", 1) > 99)
        {
                command("hehe");
                command("say 你轻功方面的造诣已经相当不错了，就到此为止吧。");
                return -1;
        }

        if (! ob->query_temp("can_learn/wusantong"))
        {
                command("smile");
                command("say 不错，不错。趁现在多学点东西是好事。");
                command("say 我就教你些内功、轻功和招架的基本常识吧。");
                ob->set_temp("can_learn/wusantong", 1);
        }
        return 1;
}

void greeting(object ob)
{
        if (! ob || environment(ob) != environment()) return;

        if (ob->query_skill("force") > 99
           && ob->query_skill("dodge") > 99
           && ob->query_skill("parry") > 99)
		return;

        command("nod " + ob->query("id"));
        command("say " + RANK_D->query_respect(ob) + "，我正在传授基本武功。");
        command("say 有空就过来学学(" HIY "xue wu santong skills" NOR + CYN ")吧。" NOR);

}
