// indian.c 印度高手

#include <ansi.h>

inherit CHALLENGER;

void create()
{
        set_name("天竺人", ({ "indian" }));
        set("long", "一个天竺人，长得非常瘦小。\n");
        set("gender", "男性");
        set("age", 20);
        set("str", 20);
        set("int", 20);
        set("con", 20);
        set("dex", 20);

        // the follow 5 setting has no use
        set("max_qi", 100);
        set("max_jing", 100);
        set("neili", 100);
        set("max_neili", 100);
        set("jiali", 100);
        set("shen", -1000);

        set("combat_exp", 3000000);
        set("scale", 100);

        set_skill("force", 1);
        set_skill("yujiashu", 1);
        set_skill("dodge", 1);
        set_skill("yujiashu", 1);
        set_skill("parry", 1);
        set_skill("finger", 1);
        set_skill("nianhua-zhi", 1);
        set_skill("strike", 1);
        set_skill("sanhua-zhang", 1);

        map_skill("finger", "nianhua-zhi");
        map_skill("strike", "sanhua-zhang");
        map_skill("force", "yujiashu");
        map_skill("dodge", "yujiashu");
        map_skill("parry", "nianhua-zhi");

        prepare_skill("strike", "sanhua-zhang");
        prepare_skill("finger", "nianhua-zhi");

        set("class", "bonze");

        set("chat_chance_combat", 120);
        set("chat_msg_combat", ({
                (: exert_function, "powerup" :),
                (: exert_function, "recover" :),
                (: perform_action, "finger.fuxue" :),
                (: perform_action, "strike.sanhua" :),
        }));

        set_temp("apply/strike", 50);
        set_temp("apply/finger", 50);
        set_temp("apply/unarmed_damage", 100);
        set_temp("apply/parry", 50);
        set_temp("apply/dodge", 50);
        set_temp("apply/force", 50);

        set("chat_lost", "中原武学真是名不虚传。");
        set("chat_win", "嗯…看来这个人武功还没有学到家，还是改日再来吧。");

        setup();

        carry_object("/clone/cloth/seng-cloth")->wear();
}

string challenge()
{
        set("opinion/msg", ({
                (random(2) ? "此人来头不小，当年达摩祖师便是来自天竺。"
                           : "这是天竺高手，和少林派乃是同源。"),
                (random(2) ? "去天竺路途遥远，十分凶险，来到中原大是不易。"
                           : "天竺瑜珈术奥妙无穷，少林绝学易筋经便是由此化来。"),
                (random(2) ? "当初达摩祖师来到中原，带来了十二项绝技，实在是非同小可。"
                           : "少林绝技博大精深，天竺武学实在不可小视啊！"),
        }));

        command(random(2) ? "bow" : "buddhi " + query("id"));
        switch (random(2))
        {
        case 0:
                return "我乃" + query("nation") + "人士，不远万里"
                        "来到中原，特地向诸位高手请教武学。";

        default:
                return "我是" + query("nation") + "的" + name() + "，还"
                       "望中原诸位武林高手赐教。";
        }
}

void unconcious()
{
}

void competition_with(object ob)
{
        command("say 好吧！我们就比划比划，勿伤和气。\n");
        ::competition_with(ob);
}

void lost()
{
        string *ob_list = ({
                "/clone/fam/pill/puti4",
                "/clone/fam/pill/sheli4",
                "/clone/fam/gift/str2",
                "/clone/fam/gift/int2",
                "/clone/fam/gift/con2",
                "/clone/fam/gift/dex2",
        });

        object ob;
        string un;

        ob = new(ob_list[random(sizeof(ob_list))]);

        if (ob->query("base_unit"))
               un = ob->query("base_unit");
        else
               un = ob->query("unit");

        message_vision(CYN "$N" CYN "双手合十，叹道：中原武学真是博大"
                       "精深，这" + un + ob->name() + CYN "就算是我求"
                       "学的赠礼吧。\n" NOR, this_object());

        ob->move(this_object(), 1);
        command("give " + ob->query("id") + " to " +
                query_competitor()->query("id"));
        ::lost();
}
