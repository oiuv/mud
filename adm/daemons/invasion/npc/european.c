// european.c 欧洲入侵者

#include <ansi.h>

inherit __DIR__"invader";

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
        set("chat_chance", 10);
        set("chat_msg", ({ (: do_leave :) }));

        set("chat_chance_combat", 200);
        set("chat_msg_combat", ({
                (: exert_function, "powerup" :),
                (: exert_function, "recover" :),
                (: perform_action, "sword.ci" :),
                (: perform_action, "sword.lian" :),
        }));        

        setup();
        if (clonep()) keep_heart_beat();
        set("born_time", time());

        carry_object("/clone/cloth/cloth")->wear();
        carry_object("/clone/weapon/xiyang-sword")->wield();
}


