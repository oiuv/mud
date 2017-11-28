#include <ansi.h>

inherit NPC;

#define MIJI "/clone/lonely/book/qixingzhi"

void create()
{
        object ob;
        set_name("孙玉溪", ({ "sun yuxi", "sun", "yuxi" }));
        set("gender", "男性");
        set("age", 42);
        set("attitude", "peaceful");
        set("shen_type", 1);
        set("str", 33);
        set("int", 35);
        set("con", 38);
        set("dex", 33);

        set("max_qi", 5200);
        set("qi", 5200);
        set("max_jing", 3000);
        set("neili", 6000);
        set("max_neili", 6000);
        set("jingli", 4000);
        set("max_jingli", 4000);
        set("jiali", 230);
        set("combat_exp", 2000000);
        set("score", 20000);

        set_skill("force", 280);
        set_skill("hunyuan-yiqi", 280);
        set_skill("dodge", 280);
        set_skill("lingxu-bu", 280);
        set_skill("parry", 280);
        set_skill("qixing-zhi", 320);
        set_skill("finger", 320);
        set_skill("literate", 220);
        set_skill("martial-cognize", 220);

        map_skill("force", "hunyuan-yiqi");
        map_skill("dodge", "lingxu-bu");
        map_skill("parry", "qixing-zhi");
        map_skill("finger", "qixing-zhi");

        prepare_skill("finger", "qixing-zhi");

        set("inquiry", ([
               "七星指" : "这正是在下的绝学，阁下为何知晓？\n",
        ]));

        set("chat_chance_combat", 120);
        set("chat_msg_combat", ({
                (: exert_function, "recover" :),
                (: exert_function, "powerup" :),
        }));

        set_temp("apply/damage", 120);
        set_temp("apply/unarmed_damage", 120);
        set_temp("apply/armor", 220);

        setup();

        if (clonep())
        {
                ob = find_object(MIJI);
                if (! ob) ob = load_object(MIJI);

                if (! environment(ob) && random(10) == 1)
                        ob->move(this_object());
        }
                
        carry_object("/clone/cloth/cloth")->wear();
}

