#include <ansi.h>

inherit NPC;
inherit F_MASTER;

void create()
{
        set_name("浪翻云", ({ "lang fangyun", "lang", "fangyun" }));
        set("title", HIC "神秘人" NOR);
        set("nickname", HIY "江湖卖艺人" NOR);        
        set("long", @LONG
他是一位神秘的江湖人氏，没有人知道他的来历，也没人知
道他的过去，他行踪不定，来去无影。只见他身着布衣，手
执长剑，身上背着一个酒葫芦，长发披肩，脸色看似十分之
憔悴和惆怅，双目正柔情地看着长空。
LONG);
        set("gender", "男性");
        set("age", 36);        
        set("attitude", "friendly");
        set("shen_type", 1);
        set("per", 30);
        set("str", 30);
        set("int", 30);
        set("con", 30);
        set("dex", 30);

        set("max_qi", 5000);
        set("max_jing", 4000);
        set("neili", 6000);
        set("max_neili", 6000);
        set("jiali", 200);
        set("combat_exp", 3500000);
        set("score", 800000);

        set_skill("force", 300);
        set_skill("duanshi-xinfa", 300);
        set_skill("dodge", 300);
        set_skill("tiannan-bu", 300);
        set_skill("cuff", 300);
        set_skill("jinyu-quan", 300);
        set_skill("strike", 300);
        set_skill("wuluo-zhang", 300);
        set_skill("sword", 300);
        set_skill("duanjia-jian", 300);
        set_skill("parry", 300);
        set_skill("literate", 300);
        set_skill("martial-cognize", 300);

        map_skill("force", "duanshi-xinfa");
        map_skill("dodge", "tiannan-bu");
        map_skill("cuff", "jinyu-quan");
        map_skill("strike", "wuluo-zhang");
        map_skill("parry", "duanjia-jian");
        map_skill("sword", "duanjia-jian");

        prepare_skill("cuff", "jinyu-quan");
        prepare_skill("strike", "wuluo-zhang");        

        set("chat_chance_combat", 120);
        set("chat_msg_combat", ({
                (: perform_action, "cuff.man" :),
                (: perform_action, "strike.bian" :),
                (: perform_action, "sword.jing" :),
                (: perform_action, "sword.lian" :),
                (: exert_function, "recover" :),
                (: exert_function, "powerup" :),                           
        }));
        
        set("chat_chance", 120);
        set("chat_msg", ({
                CYN "浪翻云深情地说道: 唉，不知道她现在过得可好，罢了，罢了......\n" NOR,                
                (: random_move :)
        }) );
        
        setup();        
        carry_object("/d/mingjiao/obj/baipao")->wear();
        carry_object("/clone/weapon/changjian")->wield();   
        if (random(4) == 1)
                set_temp("jinzhong", carry_object("/clone/lonely/book/zhaobook")); 
}


