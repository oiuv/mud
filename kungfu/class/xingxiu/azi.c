inherit NPC;

#include "xingxiu.h"

string ask_me();

void create()
{
        set_name("阿紫", ({ "a zi", "a", "zi"}));
        set("nickname", "星宿派小师妹");
        set("long", 
                "她就是丁春秋弟子阿紫。\n"
                "她容颜俏丽，可眼神中总是透出一股邪气。\n");
        set("gender", "女性");
        set("age", 15);
        set("attitude", "peaceful");
        set("class", "fighter");
        set("shen_type", -1);
        set("str", 18);
        set("int", 28);
        set("con", 20);
        set("dex", 24);
        
        set("max_qi", 300);
        set("max_jing", 300);
        set("neili", 500);
        set("max_neili", 500);
        set("jiali", 10);
        set("combat_exp", 45000);

        set_skill("force", 60);
        set_skill("guixi-gong", 60);
        set_skill("huagong-dafa", 20);
        set_skill("dodge", 40);
        set_skill("zhaixing-gong", 40);
        set_skill("strike", 40);
        set_skill("chousui-zhang", 40);
        set_skill("claw", 40);
        set_skill("sanyin-wugongzhao", 40);
        set_skill("whip", 80);
        set_skill("chanhun-suo", 80);
        set_skill("parry", 40);
        set_skill("poison", 50);
        set_skill("staff", 10);
        set_skill("tianshan-zhang", 10);

        set("no_teach", ([
                "huagong-dafa" : "化功大法让老仙教你吧，我可不愿被他罚。",
        ]));

        map_skill("force", "guixi-gong");
        map_skill("dodge", "zhaixinggong");
        map_skill("strike", "chousui-zhang");
        map_skill("claw", "sanyin-wugongzhao");
        map_skill("parry", "tianshan-zhang");
        map_skill("staff", "tianshan-zhang");
        map_skill("whip", "chanhun-suo");

        prepare_skill("strike", "chousui-zhang");
        prepare_skill("claw", "sanyin-wugongzhao");

        create_family("星宿派", 2, "弟子");

        set("chat_chance_combat", 20);
        set("chat_msg_combat", ({
                (: perform_action, "whip.suo" :),
                (: exert_function, "recover" :),
        }) );

        set("swmuding", 1);
        set("inquiry", ([
                "木鼎" : "仓库里面一大堆，你自己去找吧！",
                "神王木鼎" : "那是师傅用的，你找我干啥？",
        ]));

        setup();

        carry_object("/clone/weapon/rousisuo")->wield();
        carry_object("/d/xingxiu/obj/xxqingxin-san");
        carry_object("/d/xingxiu/obj/xxqingxin-san");
}

void attempt_apprentice(object ob)
{
        command("say 我不收徒弟！");
        return;
        welcome(ob);
        command("recruit " + ob->query("id"));
}

int accept_kill(object who)
{
        object ob;
        object *obs;

        if (! living(this_object()))
                return 1;

        if (! query("swmuding"))
        {
                command("say 神王木鼎原来的确在我这里，可是后来被人抢走啦！");
                command("inn " + who->query("id"));
                tell_object(who, "你看到阿紫一副楚楚可怜的样子，不禁心头一软。\n");
                return -1;
        }

        if (who->query("family/family_name") !=
            query("family/family_name"))
                return 1;

        obs = children("/clone/misc/swmuding");
        obs = filter_array(obs, (: ! clonep($1) :));
        if (sizeof(obs))
        {
                command("say 呜呜，神王木鼎真的被人抢走啦！");
                tell_object(who, "你看阿紫神情不象是作伪，不由得叹了一口气。\n");
                return -1;
        }

        if (who->query("combat_exp") > 500000 &&
            who->query("shen") < -10000)
        {
                message_vision("$N大叫：别动手，别动手！我给你木鼎就是！\n",
                               this_object());
                ob = new("/clone/misc/swmuding");
                ob->move(this_object());
                command("give " + ob->query("id") + " to " + who->query("id"));
                set("swmuding", 0);
                return -1;
        }

        command("say 我说了没有木鼎了，你怎么不信！");
        return 1;
}

