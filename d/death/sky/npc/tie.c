#include <ansi.h>
inherit NPC;
inherit F_GUARDER;

void create()
{
        set_name("铁传甲", ({ "tie chuanjia", "tie", "chuanjia" }) );
        set("nickname", WHT "铁甲金刚" NOR);
        set("title", "忠心护卫");
        set("gender", "男性");
        set("age", 42);
        set("long", "一个身材魁梧的汉子。\n");
        set("attitude", "peaceful");

        set("str", 40);
        set("con", 30);
        set("int", 20);
        set("dex", 30);

        set("max_qi", 4000);
        set("max_jing", 3000);
        set("neili", 5000);
        set("max_neili", 5000);
        set("jiali", 150);

        set("combat_exp", 1800000);
        set("shen_type", 1);
        set("score", 5000);

        set("chat_chance_combat", 80);
        set("chat_msg_combat", ({
                (: exert_function, "powerup" :),
                (: exert_function, "recover" :)
        }) );
        /*
        set_skill("unarmed", 220);
        set_skill("force", 220);
        set_skill("parry", 180);
        set_skill("dodge", 180);
        set_skill("cuff", 220);
        set_skill("literate", 100);
        set_skill("yijinjing", 220);
        set_skill("tiexian-quan", 220);
        set_skill("feiyan-huixiang", 180);

        map_skill("parry", "tiexian-quan");
        map_skill("force", "yijinjing");
        map_skill("unarmed", "tiexian-quan");
        map_skill("cuff", "tiexian-quan");
        map_skill("dodge", "feiyan-huixiang");

        set_temp("apply/damage", 100);
        set_temp("apply/armor", 200);
        set("apply/dodge", 100);

        set("coagents", ({
                ([ "startroom" : "/kungfu/class/sky/tianmen",
                   "id"        : "li xunhuan" ]),
        }));
        */
        setup();

        // carry_object("/kungfu/class/sky/obj/miji1");
        carry_object("/clone/cloth/cloth")->wear();
}
