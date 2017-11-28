#include <ansi.h> 

inherit NPC;
inherit F_UNIQUE;

void create()
{
        object ob; 
        set_name("钱二败", ({ "qian erbai", "erbai", "qian" }));
        set("title", "绍敏郡主座下");
        set("nickname", HIR "神箭八雄" NOR);
        set("gender", "男性");
        set("age", 25);
        set("attitude", "peaceful");
        set("shen_type", -1);
        set("str", 25);
        set("int", 25);
        set("con", 25);
        set("dex", 25);

        set("max_qi", 1000);
        set("max_jing", 1000);
        set("max_neili", 800);
        set("neili", 800);
        set("jiali", 50);

        // 增加天赋精准射击
        set("special_skill/accuracy", 1);

        set("combat_exp", 250000);

        set("chat_chance_combat", 200);
        set("chat_msg_combat", ({
                (: command("shot") :),
                (: exert_function, "recover" :),
        }));


        set_skill("dodge", 120);
        set_skill("unarmed", 120);
        set_skill("throwing", 120);
        set_skill("xuanyuan-arrow", 120);
        set_skill("changquan", 120);
        set_skill("lingxu-bu", 120);
        set_skill("force", 120);
        set_skill("hunyuan-yiqi", 120);

        map_skill("force", "hunyuan-yiqi");
        map_skill("dodge", "lingxu-bu");
        map_skill("parry", "changquan");
        map_skill("throwing", "xuanyuan-arrow");
        map_skill("unarmed", "changquan");

        setup();

        carry_object("/clone/misc/cloth")->wear();
        set_temp("handing", carry_object("/clone/weapon/goldbow2"));
        ob = carry_object("/clone/weapon/ciguarrow"); 
        ob->set_amount(30); 
}

