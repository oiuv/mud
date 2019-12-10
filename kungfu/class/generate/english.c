// english.c 英国人

#include <ansi.h>

inherit CHALLENGER;

void create()
{
        set_name("英国人", ({ "english" }));
        set("long", "一个英国人。\n");
        set("gender", "男性");
        set("age", 20);
        set("str", 40);
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
        set_skill("xiyang-neigong", 1);
        set_skill("dodge", 1);
        set_skill("xiyang-boji", 1);
        set_skill("parry", 1);
        set_skill("qishi-ji", 1);
        set_skill("club", 1);

        map_skill("club", "qishi-ji");
        map_skill("force", "xiyang-neigong");
        map_skill("dodge", "xiyang-boji");
        map_skill("parry", "qishi-ji");

        set("rank_info/rude", "红毛鬼");

        set("chat_chance_combat", 120);
        set("chat_msg_combat", ({
                (: exert_function, "powerup" :),
                (: exert_function, "recover" :),
                (: perform_action, "club.chong" :),
                (: perform_action, "club.juan" :),
        }));

        setup();

        carry_object("/clone/cloth/yinjia")->wear();
        carry_object("/clone/weapon/qishiji")->wield();
}

string challenge()
{
        set("opinion/msg", ({
                (random(2) ? "此人佩带着圣骑士勋章，想必是由英吉利女皇亲自颁发。"
                           : "此人身着重铠，手持长戟，想必应是英吉利的皇家骑士。"),
                (random(2) ? "不错，英吉利皇家骑士团向来以勇猛著称，善于冲锋陷阵。"
                           : "传说他们那里有个叫「龙枪」的勇士，其枪术已称得上是出神入化。"),
                (random(2) ? "从如此遥远的地方远度而来，也真是够难为他的了！"
                           : "嗯，长矛虽利于冲刺，但是变化略少，近身作战更见其弊。"),
        }));

        command(random(2) ? "haha" : "killair");
        switch (random(2))
        {
        case 0:
                return "我来自" + query("nation") + "，听说你们中原"
                       "武术高明，特地前来切磋切磋！";

        default:
                return "我是" + query("nation") + "皇家骑士团的" + name() + "，中"
                       "原有谁愿意和我一较高低？";
        }
}

void unconcious()
{
        command("chat 啊！怎么……怎么这么厉害？");
        die();
}

void competition_with(object ob)
{
        command("say 太好了，我们就分个高低看看！\n");
        ::competition_with(ob);
}

void lost()
{
        string *ob_list = ({
                "/clone/fam/etc/prize1",
                "/clone/fam/etc/prize2",
                "/clone/fam/etc/prize3",
                "/clone/fam/etc/prize4",
        });
        object ob;

        ob = new(ob_list[random(sizeof(ob_list))]);
        message_vision(HIY "$N" HIY "身子一退，掉下一" + ob->query("unit") +
                       ob->name() + HIY "。\n\n" NOR, this_object());

        ob->move(environment());
        ::lost();
}
