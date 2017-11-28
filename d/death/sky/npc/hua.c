#include <ansi.h>

inherit NPC;
inherit F_UNIQUE;
inherit F_COAGENT;

void create()
{
        set_name("华英雄", ({ "hua yingxiong", "hua", "yingxiong"}));
        set("long", "一个俊俏的中年男子，衣着长衫，他就是华英雄。\n"
                    "传说他命犯天煞孤星，一生漂泊，落于异地。尔后\n"
                    "习得一身绝技，兼修炼「中华傲决」，大败「东洋\n"
                    "战神」无敌。\n"); 
        set("nickname", HIW "中华英雄" NOR);
        set("title", HIY "大宗师" NOR);
        set("gender", "男性");
        set("age", 26);
        set("attitude", "friendly");
        set("shen_type", 1);
        set("str", 40);
        set("int", 40);
        set("con", 40);
        set("dex", 40);
        set("per", 40);

        set("max_qi", 8000);
        set("max_jing", 6000);
        set("max_neili", 12000);
        set("neili", 12000);
        set("jiali", 250);
        set("combat_exp", 10000000);

        set("chat_chance_combat", 100);
        set("chat_msg_combat", ({
                (: perform_action, "sword.aojue" :),
                (: exert_function, "powerup" :),
                (: exert_function, "shield" :),
        }) );
        /*

        set_skill("dodge", 460);
        set_skill("strike", 460);
        set_skill("parry", 460);
        set_skill("unarmed", 460);
        set_skill("force", 460);
        set_skill("sword", 460);
        set_skill("siji-jianfa", 460);
        set_skill("zhonghua-aojue", 460);
        set_skill("literate", 200);

        map_skill("force", "zhonghua-aojue");
        map_skill("sword", "zhonghua-aojue");
        map_skill("dodge", "zhonghua-aojue");
        map_skill("parry", "zhonghua-aojue");
        map_skill("strike", "zhonghua-aojue");
        map_skill("unarmed", "zhonghua-aojue");

        prepare_skill("strike", "zhonghua-aojue");
        */

        setup();

        carry_object(__DIR__"obj/cloth3")->wear();
        carry_object(__DIR__"obj/chijian")->wield();
        // carry_object("/kungfu/class/sky/obj/miji2");
}

