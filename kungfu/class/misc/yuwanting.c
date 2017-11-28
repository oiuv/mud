#include <ansi.h>

inherit "/inherit/char/punisher";

void create()
{
        set_name("于万亭", ({ "yu wanting", "yu", "wanting" }));
        set("long",  "这是早已归隐的红花会上代总舵主于万亭。\n");
        set("gender", "男性");
        set("age", 67);
        set("attitude", "peaceful");
        set("shen_type", 1);
        set("str", 33);
        set("int", 36);
        set("con", 34);
        set("dex", 33);
        
        set("max_qi", 6000);
        set("max_jing", 3000);
        set("neili", 7500);
        set("max_neili", 7500);
        set("jiali", 150);
        set("combat_exp", 2500000);
        set("score", 10000000);

        set_skill("force", 280);
        set_skill("tianchi-neigong", 280);
        set_skill("honghua-xinfa", 260);
        set_skill("dodge", 260);
        set_skill("yanzi-chuanyun", 260);
        set_skill("parry", 260);
        set_skill("strike", 260);
        set_skill("benlei-zhang", 260);
        set_skill("blade", 240);
        set_skill("hanwang-qingdao", 240);
        set_skill("whip", 280);
        set_skill("jiandun-zhusuo", 280);
        set_skill("martial-cognize", 260);
        set_skill("literate", 260);

        map_skill("force" , "tianchi-neigong");
        map_skill("blade" , "hanwang-qingdao");
        map_skill("strike" , "benlei-zhang");
        map_skill("dodge" , "yanzi-chuanyun");
        map_skill("parry" , "jiandun-zhusuo");
        map_skill("whip", "jiandun-zhusuo");

        prepare_skill("strike", "benlei-zhang");

        create_family("红花会", 0, "总舵主");

        set("chat_chance_combat", 120);
        set("chat_msg_combat", ({
                (: perform_action, "whip.qian" :),
                (: perform_action, "whip.fu" :),
                (: perform_action, "strike.lei" :),
                (: exert_function, "recover" :),
        }));

        setup();
        carry_object("/clone/weapon/changbian")->wield();
        carry_object("/clone/cloth/cloth")->wear();
}
