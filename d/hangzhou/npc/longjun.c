// longjun.c

#include <ansi.h>

inherit NPC;

void create()
{
        set_name("龙骏", ({ "long jun", "long", "jun"}) );
        set("title", "御前侍卫");
        set("gender", "男性");
        set("age", 32);
        set("long",
                "龙骏是大内高手，一手喂毒暗器，少有其匹。\n");
        set("combat_exp", 300000);
        set("shen_type", -1);
        set("attitude", "heroism");

        set_skill("jingang-quan", 120);
        set_skill("cuff", 120);
        set_skill("throwing", 140);
        set_skill("parry", 120);
        set_skill("dodge", 130);
        set_skill("mantian-xing", 140);
        set_skill("shaolin-shenfa", 130);

        map_skill("cuff", "jingang-quan");
        map_skill("throwing", "mantian-xing");
        map_skill("parry", "mantian-xing");
        map_skill("dodge", "shaolin-shenfa");

        prepare_skill("cuff", "jingang-quan");

        set("chat_chance_combat", 120);
        set("chat_msg_combat", ({
                (: perform_action, "throwing.shan" :),
                (: exert_function, "recover" :),
        }));

        setup();
        carry_object("/d/city/obj/tiejia")->wear();
        set_temp("handing", carry_object("/clone/weapon/jili"));

        add_money("coin", 10);
}

