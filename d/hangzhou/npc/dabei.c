#include <ansi.h>

inherit NPC;

#define MIJI "/clone/lonely/book/lianhuazhi.c"

void create()
{
        object ob;
        set_name("大悲尊者", ({ "dabei zunzhe", "dabei", "zunzhe" }));
        set("gender", "男性");
        set("nickname", HIY "灵隐寺住持" NOR);
        set("long", @LONG
他看上去须眉皆白，眼神却异常有神。
LONG);
        set("age", 72);
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
        set_skill("yijinjing", 280);
        set_skill("dodge", 280);
        set_skill("shaolin-shenfa", 280);
        set_skill("parry", 280);
        set_skill("lianhua-zhi", 320);
        set_skill("finger", 320);
        set_skill("literate", 220);
        set_skill("martial-cognize", 220);

        map_skill("force", "yijinjing");
        map_skill("dodge", "shaolin-shenfa");
        map_skill("parry", "lianhua-zhi");
        map_skill("finger", "lianhua-zhi");

        prepare_skill("finger", "lianhua-zhi");

        set("inquiry", ([
               "莲花指" : "这正是贫僧的绝学，阁下为何知晓？\n",
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

