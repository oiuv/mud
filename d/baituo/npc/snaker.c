#include <ansi.h>
inherit NPC;
inherit F_DEALER;

void create()
{
        set_name("舞蛇人", ({ "wushe ren", "wushen", "ren" }));
        set("long", "他是一个西域来的舞蛇人。\n");
        set("title", "西域蛇王");
        set("nickname", HIY "蛇见怕" NOR);
        set("gender", "男性");
        set("age", 33);
        set("attitude", "friendly");
        set("shen_type", -1);
        set("str", 25);
        set("int", 24);
        set("con", 25);
        set("dex", 26);

        set_skill("unarmed", 75);
        set_skill("dodge", 65);
        set_skill("parry", 65);
        set_skill("force", 60);

        set("neili", 400);
        set("max_neili", 400);
        set("jiali", 20);
        set("combat_exp", 30000);
        set("snake_mount" ,3);
        set("score", 10000);

        set("chat_chance",5);
        set("chat_msg", ({
                CYN "舞蛇人吆喝道：停一停，看一看，有上好的蛇胆粉出售了。\n" NOR,
                CYN "舞蛇人把手腕划出一道口子，又敷上蛇胆粉，咦，流血立即停止了。\n" NOR,
                CYN "舞蛇人把手里的蛇舞来舞去道：货真价实的啦，别错过好机会。\n" NOR,
        }));

        set("inquiry", ([
                "白驼山" : "我这里的蛇胆粉就是用白驼山的蛇精心制作的。\n",
                "蛇胆粉" : "我的蛇胆粉能治各种外伤，疗效不凡。\n",
        ]));
        set("vendor_goods", ({
                "/d/baituo/obj/fen",
        }));
        setup();
        carry_object("/d/baituo/obj/baipao")->wear();
}

void init()
{
        object ob;

        ::init();

        add_action("do_list", "list");
        add_action("do_buy", "buy");

        if (interactive(ob = this_player()) && ! is_fighting())
        {
                remove_call_out("greeting");
                call_out("greeting", 1, ob);
        }
       
}

void greeting(object ob)
{
        if (! ob || environment(ob) != environment())
                return;

        say(CYN "舞蛇人道：这位" + RANK_D->query_respect(ob) +
            CYN "，买我包蛇胆粉吧，包您满意。\n");

        return;
}

int accept_fight(object ob)
{
        object obn;

        if (! objectp(present("mang she", environment(ob))))
        {
                if (query("snake_mount") <= 0)
                {
                        message_vision(CYN "舞蛇人愣了愣，说道：嗯…今天俺"
                                       "没抄家伙，算了吧。\n" NOR, ob);
                        return 0;
                }
                message_vision(CYN "舞蛇人大叫一声：竟敢跟老子过不去，尝尝"
                               "蛇的厉害。\n" NOR, ob);
                obn=new("/clone/beast/mangshe");
                obn->move(environment(ob));
                obn->kill_ob(ob);
                add("snake_mount", -1);
                return 0;
        }

        message_vision(CYN "舞蛇人大怒道：让你小子尝尝老子的厉害。\n" NOR, ob);
        return 1;
}
