// european.c 西洋人

#include <ansi.h>

inherit CHALLENGER;

void create()
{
        set_name("西洋人", ({ "european" }));
        set("long", "一个西洋人。\n");
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
        set_skill("xiyang-neigong", 1);
        set_skill("dodge", 1);
        set_skill("xiyang-boji", 1);
        set_skill("parry", 1);
        set_skill("xiyang-jian", 1);
        set_skill("sword", 1);

        map_skill("sword", "xiyang-jian");
        map_skill("force", "xiyang-neigong");
        map_skill("dodge", "xiyang-boji");
        map_skill("parry", "xiyang-jian");

        set("rank_info/rude", "红毛鬼");

        set("chat_chance_combat", 120);
        set("chat_msg_combat", ({
                (: exert_function, "powerup" :),
                (: exert_function, "recover" :),
                (: perform_action, "sword.ci" :),
                (: perform_action, "sword.lian" :),
        }));

        setup();

        carry_object("/clone/cloth/cloth")->wear();
        carry_object("/clone/weapon/xiyang-sword")->wield();
}

string challenge()
{
        set("opinion/msg", ({
                (random(2) ? "此人来自据说是比俄罗斯的莫斯科还要遥远的西方。"
                           : "这是西洋武士，和我们中土人大不一样。"),
                (random(2) ? "是啊，遥远的地方，武技也是颇为奇特。"
                           : "嗯，西洋剑术适宜刺击，不过并不善于劈砍。"),
                (random(2) ? "从如此遥远的地方赶来，也真是够难为他的了！"
                           : "西洋剑术固然注重实战效果，不过仍然算不得是上乘剑术。"),
        }));

        command(random(2) ? "haha" : "killair");
        switch (random(2))
        {
        case 0:
                return "我来自" + query("nation") + "，听说你们中原"
                        "武术高明，特地前来切磋切磋！";

        default:
                return "我是" + query("nation") + "的" + name() + "，你们中"
                       "原有没有人愿意和我比试一下武艺？";
        }
}

void unconcious()
{
        command("chat 啊！怎么……怎么这么厉害？");
        die();
}

void competition_with(object ob)
{
        command("say 好吧！我们就分个高低看看！\n");
        ::competition_with(ob);
}

void lost()
{
        string *ob_list = ({
                "/clone/fam/etc/prize1",
                "/clone/fam/etc/prize3",
                "/clone/fam/etc/prize4",
                "/clone/fam/etc/prize5",
        });
        object ob;

        ob = new(ob_list[random(sizeof(ob_list))]);
        message_vision(HIY "$N" HIY "身子一退，掉下一" + ob->query("unit") +
                       ob->name() + HIY "。\n\n" NOR, this_object());

        ob->move(environment());
        ::lost();
}

