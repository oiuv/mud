#include <ansi.h>

inherit KNOWER;
inherit F_DEALER;

void create()
{
        set_name("阿芳", ({ "a fang", "a", "fang" }));
        set("title", "茶僚老板娘");
        set("nickname", HIC "消息灵通" NOR);
        set("shen_type", 1);

        set("str", 30);
        set("gender", "女性");
        set("age", 20);
        set("long", "阿芳貌似鲜花，可不知道的原因，迟迟不嫁，惹得爷儿们心痒痒。\n");
        set("combat_exp", 500);
        set("attitude", "friendly");
        set("inquiry", ([
                "结婚" : "结婚？你有几万两黄金？筹够了来找我吧。\n",
                "生意" : "这个么……还将就。\n",
        ]));

        set("vendor_goods", ({
                "/d/city/npc/obj/peanut",
                "/d/city/npc/obj/tofu",
        }));

        setup();
        carry_object("/clone/misc/cloth")->wear();
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
        add_action("do_list", "list");
        add_action("do_buy", "buy");
}

void greeting(object ob)
{
        if ( ! ob || environment(ob) != environment())
                return;

        switch(random(2))
        {
        case 0 :
                say(CYN "阿芳笑眯眯地说道：这位" + RANK_D->query_respect(ob)
                    + CYN + "，快请进来喝杯热茶。\n" NOR);
                break;
        case 1 :
                say(CYN "阿芳说道：哟！这位" + RANK_D->query_respect(ob)
                    + CYN + "您来了啊！\n" NOR);
                break;
        }
}
